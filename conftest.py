"""
Lab Thingy Test Configuration
This file configures pytest for the entire Lab Thingy application
"""

import pytest
import asyncio
from unittest.mock import MagicMock
import sys
import os

# Add project paths to Python path for imports
project_root = os.path.dirname(__file__)
sys.path.insert(0, project_root)

# Configure asyncio for pytest-asyncio
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Mock external dependencies
@pytest.fixture(autouse=True)
def mock_external_services():
    """Mock external services like Auth0, MongoDB, etc."""
    with pytest.MonkeyPatch.context() as m:
        # Mock Auth0
        m.setenv("AUTH0_DOMAIN", "test-domain.auth0.com")
        m.setenv("AUTH0_CLIENT_ID", "test-client-id")
        m.setenv("AUTH0_CLIENT_SECRET", "test-client-secret")
        
        # Mock MongoDB
        m.setenv("MONGO_HOST", "localhost")
        m.setenv("MONGO_PORT", "27017")
        
        # Mock Kubernetes
        m.setenv("KUBERNETES_SERVICE_HOST", "")
        m.setenv("KUBERNETES_SERVICE_PORT", "")
        
        yield

# Database fixtures
@pytest.fixture
def clean_database():
    """Ensure clean database state for each test"""
    # This would clean up any test databases
    yield
    # Cleanup code here

# Common test data
@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User"
    }

@pytest.fixture
def sample_lesson_data():
    """Sample lesson data for testing"""
    return {
        "name": "Test Lesson",
        "text": "<p>This is a test lesson</p>",
        "example_code": 'print("Hello World")',
        "expected_output": "Hello World",
        "topic_id": "1",
        "display_index": 1
    }

@pytest.fixture
def sample_category_data():
    """Sample category data for testing"""
    return {
        "name": "Python Basics",
        "description": "Learn Python fundamentals"
    }

# Mock JWT tokens
@pytest.fixture
def valid_jwt_token():
    """Valid JWT token for testing"""
    return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJsYWJfaWQiOiJ0ZXN0LWxhYi0xMjMiLCJleHAiOjk5OTk5OTk5OTl9.test_signature"

@pytest.fixture
def invalid_jwt_token():
    """Invalid JWT token for testing"""
    return "invalid.jwt.token"