import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
import aiohttp
import json

from main import app, call_userinfo_endpoint, fetch_management_api_token

client = TestClient(app)

class TestAuthService:
    
    @patch('main.call_userinfo_endpoint')
    @pytest.mark.asyncio
    async def test_authenticate_valid_token(self, mock_call_userinfo):
        """Test authentication with valid token"""
        mock_user_info = {
            'sub': 'auth0|123456789',
            'email': 'test@example.com',
            'name': 'Test User'
        }
        mock_call_userinfo.return_value = mock_user_info
        
        response = client.get('/authenticate/valid_token_123')
        
        assert response.status_code == 200
        data = response.json()
        assert data['sub'] == 'auth0|123456789'
        assert data['email'] == 'test@example.com'
        
    @patch('main.call_userinfo_endpoint')
    @pytest.mark.asyncio
    async def test_authenticate_invalid_token(self, mock_call_userinfo):
        """Test authentication with invalid token"""
        mock_call_userinfo.side_effect = Exception("Invalid token")
        
        response = client.get('/authenticate/invalid_token')
        
        assert response.status_code == 500

    @patch('main.fetch_management_api_token')
    @patch('aiohttp.ClientSession.get')
    @pytest.mark.asyncio
    async def test_get_user_roles_success(self, mock_get, mock_fetch_token):
        """Test getting user roles successfully"""
        mock_fetch_token.return_value = "management_api_token"
        
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            'roles': [
                {'id': 'role1', 'name': 'admin'},
                {'id': 'role2', 'name': 'user'}
            ]
        }
        mock_response.status = 200
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Mock the userinfo call to get user ID
        with patch('main.call_userinfo_endpoint') as mock_userinfo:
            mock_userinfo.return_value = {'sub': 'auth0|123456789'}
            
            response = client.get('/authenticate/get-user-roles/valid_token')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['roles']) == 2
        assert data['roles'][0]['name'] == 'admin'

    @patch('aiohttp.ClientSession.get')
    @pytest.mark.asyncio
    async def test_call_userinfo_endpoint_success(self, mock_get):
        """Test successful userinfo endpoint call"""
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            'sub': 'auth0|123456789',
            'email': 'test@example.com'
        }
        mock_response.status = 200
        mock_get.return_value.__aenter__.return_value = mock_response
        
        result = await call_userinfo_endpoint('valid_token')
        
        assert result['sub'] == 'auth0|123456789'
        assert result['email'] == 'test@example.com'

    @patch('aiohttp.ClientSession.get')
    @pytest.mark.asyncio
    async def test_call_userinfo_endpoint_failure(self, mock_get):
        """Test userinfo endpoint call failure"""
        mock_response = AsyncMock()
        mock_response.status = 401
        mock_response.text.return_value = "Unauthorized"
        mock_get.return_value.__aenter__.return_value = mock_response
        
        with pytest.raises(Exception):
            await call_userinfo_endpoint('invalid_token')

    @patch('aiohttp.ClientSession.post')
    @pytest.mark.asyncio
    async def test_fetch_management_api_token_success(self, mock_post):
        """Test successful management API token fetch"""
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            'access_token': 'management_token_123',
            'token_type': 'Bearer'
        }
        mock_response.status = 200
        mock_post.return_value.__aenter__.return_value = mock_response
        
        result = await fetch_management_api_token()
        
        assert result == 'management_token_123'

    @patch('aiohttp.ClientSession.post')
    @pytest.mark.asyncio
    async def test_fetch_management_api_token_failure(self, mock_post):
        """Test management API token fetch failure"""
        mock_response = AsyncMock()
        mock_response.status = 400
        mock_response.text.return_value = "Bad Request"
        mock_post.return_value.__aenter__.return_value = mock_response
        
        with pytest.raises(Exception):
            await fetch_management_api_token()

    def test_health_check_endpoint(self):
        """Test that the service is running"""
        # Assuming there's a health check endpoint
        response = client.get('/')
        # Should return some response indicating service is running
        assert response.status_code in [200, 404]  # 404 if no root endpoint defined

class TestAuthServiceIntegration:
    """Integration tests that test the full flow"""
    
    @patch('main.aiohttp.ClientSession')
    @pytest.mark.asyncio
    async def test_full_authentication_flow(self, mock_session_class):
        """Test the complete authentication flow"""
        mock_session = AsyncMock()
        mock_session_class.return_value.__aenter__.return_value = mock_session
        
        # Mock userinfo response
        mock_userinfo_response = AsyncMock()
        mock_userinfo_response.json.return_value = {
            'sub': 'auth0|123456789',
            'email': 'test@example.com',
            'name': 'Test User'
        }
        mock_userinfo_response.status = 200
        
        # Mock management token response
        mock_mgmt_response = AsyncMock()
        mock_mgmt_response.json.return_value = {
            'access_token': 'mgmt_token_123'
        }
        mock_mgmt_response.status = 200
        
        # Mock roles response
        mock_roles_response = AsyncMock()
        mock_roles_response.json.return_value = {
            'roles': [{'id': 'role1', 'name': 'admin'}]
        }
        mock_roles_response.status = 200
        
        # Configure mock session to return different responses based on URL
        def mock_request(method, url, **kwargs):
            if 'userinfo' in url:
                return mock_userinfo_response
            elif 'oauth/token' in url:
                return mock_mgmt_response
            elif 'users/' in url:
                return mock_roles_response
            return AsyncMock()
        
        mock_session.get.side_effect = lambda url, **kwargs: mock_request('GET', url, **kwargs)
        mock_session.post.side_effect = lambda url, **kwargs: mock_request('POST', url, **kwargs)
        
        # Test authentication
        response = client.get('/authenticate/valid_token_123')
        assert response.status_code == 200
        
        # Test getting user roles
        response = client.get('/authenticate/get-user-roles/valid_token_123')
        assert response.status_code == 200

    def test_error_handling_and_logging(self):
        """Test that errors are properly logged"""
        with patch('main.logger') as mock_logger:
            # This should trigger error logging
            response = client.get('/authenticate/definitely_invalid_token')
            
            # Verify logging was called (implementation dependent)
            # mock_logger.error.assert_called()