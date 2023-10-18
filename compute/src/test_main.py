import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from main import app


@pytest.fixture
def test_client():
    return TestClient(app)


@patch('main.client.CoreV1Api', autospec=True)
def test_start_container(mock_corev1api_class, test_client):
    mock_corev1api_instance = MagicMock()
    mock_corev1api_class.return_value = mock_corev1api_instance

    response = test_client.get('/compute/start/test_user_id')

    assert response.status_code == 200
    assert response.text.strip() == '"Container test_user_id created."'.strip()
    mock_corev1api_instance.create_namespaced_pod.assert_called_once()


# @patch('main._generate_hash', return_value='mocked_hash')
# @patch('main.tempfile.mkdtemp')
# @patch('main.subprocess.run')
# @patch('main.open', create=True)
# def test_attach_to_container_run_script(mock_open, mock_subprocess_run, mock_tempfile_mkdtemp, mock_generate_hash, test_client):
#     mock_temp_dir = '/mocked/temp/dir'
#     mock_tempfile_mkdtemp.return_value = mock_temp_dir
#
#     mock_subprocess_run.return_value = MagicMock(stdout=b'Hello, World!\n', stderr=b'')
#
#     script = ['print("Hello, World!")']
#     response = test_client.post('/compute/run', data={'script': script, 'user_id': 'test_user_id'})
#
#     mock_generate_hash.assert_called_once()
#     mock_tempfile_mkdtemp.assert_called_once_with(prefix='mocked_hash')
#
#     script_path = os.path.join(mock_temp_dir, 'script.py')
#     mock_open.assert_called_once_with(script_path, 'w')
#
#     mock_file = mock_open.return_value
#     mock_file.write('print("Hello, World!")')
#
#     mock_subprocess_run(
#         ['python', script_path],
#         capture_output=True,
#         text=True
#     )
#
#     assert response.status_code == 200
#     assert response.json() == {'stdout': 'Hello, World!\n', 'stderr': ''}


@patch('main.subprocess.run')
def test_delete_container(mock_subprocess_run, test_client):
    mock_subprocess_run.return_value = MagicMock()

    response = test_client.get('/compute/delete/test_user_id')

    assert response.status_code == 200
    mock_subprocess_run.assert_called_once_with(['kubectl', 'delete', 'pod', 'test_user_id', '--namespace', 'default'])


@patch('main.subprocess.run')
def test_get_pod(mock_subprocess_run, test_client):
    mock_subprocess_run.return_value = MagicMock(stdout=b'test_user_id    Running\n', stderr=b'')

    response = test_client.get('/compute/get-pod/test_user_id')

    assert response.status_code == 200
    assert response.json() is True
    mock_subprocess_run.assert_called_once_with(['kubectl', 'get', 'pod', 'test_user_id'], capture_output=True)
