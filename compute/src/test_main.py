import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, mock_open
import os
import tempfile

from PyProdigy.compute.src.old_main import app, _create_run_pod_manifest, _check_for_infinite_loop

client = TestClient(app)


class TestComputeService:

    @patch('main.client.CoreV1Api')
    def test_start_container_success(self, mock_corev1api_class):
        """Test successful container start"""
        mock_corev1api_instance = MagicMock()
        mock_corev1api_class.return_value = mock_corev1api_instance

        # Mock the JWT token in request headers
        headers = {"Authorization": "Bearer valid_jwt_token"}

        with patch('main.TokenValidationMiddleware') as mock_middleware:
            response = client.get('/compute/start/test_user_id', headers=headers)

        assert response.status_code == 200
        assert "Container test_user_id created" in response.text
        mock_corev1api_instance.create_namespaced_pod.assert_called_once()

    @patch('main.client.CoreV1Api')
    def test_start_container_kubernetes_error(self, mock_corev1api_class):
        """Test container start with Kubernetes API error"""
        mock_corev1api_instance = MagicMock()
        mock_corev1api_class.return_value = mock_corev1api_instance
        mock_corev1api_instance.create_namespaced_pod.side_effect = Exception("K8s error")

        headers = {"Authorization": "Bearer valid_jwt_token"}

        response = client.get('/compute/start/test_user_id', headers=headers)

        assert response.status_code == 500

    @patch('main.subprocess.run')
    def test_run_script_success(self, mock_subprocess_run):
        """Test successful script execution"""
        mock_subprocess_run.return_value = MagicMock(
            stdout="Hello World\n",
            stderr="",
            returncode=0
        )

        with patch('main.tempfile.mkdtemp') as mock_mkdtemp, \
             patch('main.open', mock_open()) as mock_file, \
             patch('main.binascii.hexlify') as mock_hexlify:

            mock_mkdtemp.return_value = '/tmp/test_dir'
            mock_hexlify.return_value = b'abcd1234'

            script_data = {
                'script': 'print("Hello World")',
                'user_id': 'test_user'
            }

            response = client.post('/compute/run', data=script_data)

        assert response.status_code == 200
        data = response.json()
        assert data['stdout'] == "Hello World\n"
        assert data['stderr'] == ""

    @patch('main.subprocess.run')
    def test_run_script_with_error(self, mock_subprocess_run):
        """Test script execution with Python error"""
        mock_subprocess_run.return_value = MagicMock(
            stdout="",
            stderr="NameError: name 'x' is not defined\n",
            returncode=1
        )

        with patch('main.tempfile.mkdtemp') as mock_mkdtemp, \
             patch('main.open', mock_open()) as mock_file, \
             patch('main.binascii.hexlify') as mock_hexlify:

            mock_mkdtemp.return_value = '/tmp/test_dir'
            mock_hexlify.return_value = b'abcd1234'

            script_data = {
                'script': 'print(x)',  # This will cause a NameError
                'user_id': 'test_user'
            }

            response = client.post('/compute/run', data=script_data)

        assert response.status_code == 200
        data = response.json()
        assert "NameError" in data['stderr']

    def test_check_for_infinite_loop_detection(self):
        """Test infinite loop detection"""
        infinite_loop_code = """
while True:
    print("This will run forever")
"""

        result = _check_for_infinite_loop(infinite_loop_code)
        assert result is True

        safe_code = """
for i in range(10):
    print(i)
"""

        result = _check_for_infinite_loop(safe_code)
        assert result is False

    def test_create_run_pod_manifest(self):
        """Test pod manifest creation"""
        pod_manifest = _create_run_pod_manifest("python:3.9", "test_user")

        assert pod_manifest.metadata.name == "test_user"
        assert pod_manifest.spec.containers[0].image == "python:3.9"
        assert pod_manifest.spec.restart_policy == "Never"

    @patch('main.subprocess.run')
    def test_delete_container(self, mock_subprocess_run):
        """Test container deletion"""
        mock_subprocess_run.return_value = MagicMock(returncode=0)

        response = client.get('/compute/delete/test_user_id')

        assert response.status_code == 200
        mock_subprocess_run.assert_called_once_with([
            'kubectl', 'delete', 'pod', 'test_user_id', '--namespace', 'default'
        ])

    @patch('main.subprocess.run')
    def test_get_pod_status_running(self, mock_subprocess_run):
        """Test getting pod status when running"""
        mock_subprocess_run.return_value = MagicMock(
            stdout=b'test_user_id    Running\n',
            stderr=b'',
            returncode=0
        )

        response = client.get('/compute/get-pod/test_user_id')

        assert response.status_code == 200
        assert response.json() is True

    @patch('main.subprocess.run')
    def test_get_pod_status_not_found(self, mock_subprocess_run):
        """Test getting pod status when pod doesn't exist"""
        mock_subprocess_run.return_value = MagicMock(
            stdout=b'',
            stderr=b'Error from server (NotFound): pods "test_user_id" not found\n',
            returncode=1
        )

        response = client.get('/compute/get-pod/test_user_id')

        assert response.status_code == 200
        assert response.json() is False

    @patch('main.os.access')
    @patch('main.tempfile.mkdtemp')
    @patch('main.subprocess.run')
    def test_run_script_file_permissions(self, mock_subprocess_run, mock_mkdtemp, mock_access):
        """Test script execution with file permission handling"""
        mock_mkdtemp.return_value = '/tmp/test_dir'
        mock_access.return_value = True
        mock_subprocess_run.return_value = MagicMock(
            stdout="Success\n",
            stderr="",
            returncode=0
        )

        with patch('main.open', mock_open()) as mock_file, \
             patch('main.binascii.hexlify') as mock_hexlify:

            mock_hexlify.return_value = b'abcd1234'

            script_data = {
                'script': 'print("Success")',
                'user_id': 'test_user'
            }

            response = client.post('/compute/run', data=script_data)

        assert response.status_code == 200

    @patch('main.shutil.rmtree')
    @patch('main.tempfile.mkdtemp')
    @patch('main.subprocess.run')
    def test_cleanup_after_execution(self, mock_subprocess_run, mock_mkdtemp, mock_rmtree):
        """Test that temporary directories are cleaned up"""
        mock_mkdtemp.return_value = '/tmp/test_dir'
        mock_subprocess_run.return_value = MagicMock(
            stdout="Test\n",
            stderr="",
            returncode=0
        )

        with patch('main.open', mock_open()) as mock_file, \
             patch('main.binascii.hexlify') as mock_hexlify:

            mock_hexlify.return_value = b'abcd1234'

            script_data = {
                'script': 'print("Test")',
                'user_id': 'test_user'
            }

            response = client.post('/compute/run', data=script_data)

        assert response.status_code == 200
        # Verify cleanup was called
        mock_rmtree.assert_called_once_with('/tmp/test_dir')


class TestComputeMiddleware:

    def test_token_validation_middleware(self):
        """Test JWT token validation middleware"""
        # This would require mocking the middleware more extensively
        # For now, test that endpoints require authentication

        response = client.get('/compute/start/test_user_id')
        # Should fail without proper JWT token
        assert response.status_code in [401, 403, 422]  # Various auth failure codes

    def test_invalid_jwt_token(self):
        """Test behavior with invalid JWT token"""
        headers = {"Authorization": "Bearer invalid_token"}

        response = client.get('/compute/start/test_user_id', headers=headers)
        # Should fail with invalid token
        assert response.status_code in [401, 403, 422]
