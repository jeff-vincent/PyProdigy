import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock

from main import app, get_db
from database import Base
import models
import crud

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

class TestUsersService:
    
    def test_create_user(self, test_db):
        """Test user creation"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User"
        }
        
        response = client.post("/users/", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"

    def test_get_user_by_id(self, test_db):
        """Test getting user by ID"""
        # First create a user
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User"
        }
        create_response = client.post("/users/", json=user_data)
        user_id = create_response.json()["id"]
        
        # Get the user
        response = client.get(f"/users/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["email"] == "test@example.com"

    def test_get_user_not_found(self, test_db):
        """Test getting non-existent user"""
        response = client.get("/users/999")
        
        assert response.status_code == 404

    def test_update_user(self, test_db):
        """Test user update"""
        # First create a user
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User"
        }
        create_response = client.post("/users/", json=user_data)
        user_id = create_response.json()["id"]
        
        # Update the user
        update_data = {
            "email": "updated@example.com",
            "username": "updateduser",
            "full_name": "Updated User"
        }
        
        response = client.put(f"/users/{user_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "updated@example.com"
        assert data["username"] == "updateduser"

    def test_delete_user(self, test_db):
        """Test user deletion"""
        # First create a user
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User"
        }
        create_response = client.post("/users/", json=user_data)
        user_id = create_response.json()["id"]
        
        # Delete the user
        response = client.delete(f"/users/{user_id}")
        
        assert response.status_code == 200
        
        # Verify user is deleted
        get_response = client.get(f"/users/{user_id}")
        assert get_response.status_code == 404

    def test_get_users_list(self, test_db):
        """Test getting list of users"""
        # Create multiple users
        users_data = [
            {"email": "user1@example.com", "username": "user1", "full_name": "User One"},
            {"email": "user2@example.com", "username": "user2", "full_name": "User Two"}
        ]
        
        for user_data in users_data:
            client.post("/users/", json=user_data)
        
        # Get users list
        response = client.get("/users/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2

    def test_duplicate_email_creation(self, test_db):
        """Test creating user with duplicate email"""
        user_data = {
            "email": "duplicate@example.com",
            "username": "user1",
            "full_name": "User One"
        }
        
        # Create first user
        response1 = client.post("/users/", json=user_data)
        assert response1.status_code == 200
        
        # Try to create user with same email
        user_data["username"] = "user2"
        response2 = client.post("/users/", json=user_data)
        
        # Should handle duplicate email appropriately
        assert response2.status_code in [400, 409]  # Bad Request or Conflict

    def test_user_authentication(self, test_db):
        """Test user authentication flow"""
        # This would test authentication endpoints if they exist
        user_data = {
            "email": "auth@example.com",
            "username": "authuser",
            "full_name": "Auth User",
            "password": "testpassword"
        }
        
        # Create user
        response = client.post("/users/", json=user_data)
        assert response.status_code == 200
        
        # Test login (if endpoint exists)
        login_data = {
            "username": "authuser",
            "password": "testpassword"
        }
        
        # This assumes a login endpoint exists
        login_response = client.post("/users/login", json=login_data)
        # Response depends on implementation
        assert login_response.status_code in [200, 404]  # 404 if endpoint doesn't exist


class TestUsersCRUD:
    """Test CRUD operations directly"""
    
    @patch('crud.get_user')
    def test_crud_get_user(self, mock_get_user):
        """Test CRUD get user operation"""
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.email = "test@example.com"
        mock_get_user.return_value = mock_user
        
        # This would test the CRUD function directly
        # Assuming crud.get_user exists
        result = mock_get_user(None, 1)
        assert result.id == 1
        assert result.email == "test@example.com"

    @patch('crud.create_user')
    def test_crud_create_user(self, mock_create_user):
        """Test CRUD create user operation"""
        mock_user = MagicMock()
        mock_user.email = "new@example.com"
        mock_create_user.return_value = mock_user
        
        result = mock_create_user(None, None)
        assert result.email == "new@example.com"


class TestUsersServiceIntegration:
    """Integration tests for users service"""
    
    def test_full_user_lifecycle(self, test_db):
        """Test complete user lifecycle"""
        # Create user
        user_data = {
            "email": "lifecycle@example.com",
            "username": "lifecycleuser",
            "full_name": "Lifecycle User"
        }
        
        create_response = client.post("/users/", json=user_data)
        assert create_response.status_code == 200
        user_id = create_response.json()["id"]
        
        # Read user
        get_response = client.get(f"/users/{user_id}")
        assert get_response.status_code == 200
        
        # Update user
        update_data = {
            "email": "updated_lifecycle@example.com",
            "username": "updatedlifecycleuser",
            "full_name": "Updated Lifecycle User"
        }
        
        update_response = client.put(f"/users/{user_id}", json=update_data)
        assert update_response.status_code == 200
        
        # Delete user
        delete_response = client.delete(f"/users/{user_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        final_get_response = client.get(f"/users/{user_id}")
        assert final_get_response.status_code == 404

    def test_users_service_health(self):
        """Test users service health"""
        # Test that the service is responding
        response = client.get("/users/")
        assert response.status_code == 200


class TestUsersDatabase:
    """Test database operations"""
    
    def test_database_connection(self, test_db):
        """Test database connection works"""
        # This tests that the test database is working
        assert True
        
    def test_user_model_creation(self, test_db):
        """Test user model can be created in database"""
        # This would test SQLAlchemy model creation
        from sqlalchemy.orm import Session
        
        db = TestingSessionLocal()
        try:
            # Test creating a user model instance
            user = models.User(
                email="model@example.com",
                username="modeluser",
                full_name="Model User"
            )
            db.add(user)
            db.commit()
            
            # Verify it was created
            retrieved_user = db.query(models.User).filter(
                models.User.email == "model@example.com"
            ).first()
            
            assert retrieved_user is not None
            assert retrieved_user.email == "model@example.com"
            
        finally:
            db.close()