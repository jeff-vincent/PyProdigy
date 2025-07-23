import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock

from main import app, get_db
from database import Base
import models
import schemas

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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

class TestLessonsAPI:
    def test_create_category(self, test_db):
        category_data = {
            "name": "Python Basics",
            "description": "Learn Python fundamentals"
        }
        
        response = client.post("/lessons/category", json=category_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Python Basics"
        assert data["description"] == "Learn Python fundamentals"

    def test_get_categories(self, test_db):
        # First create a category
        category_data = {
            "name": "Python Basics",
            "description": "Learn Python fundamentals"
        }
        client.post("/lessons/category", json=category_data)
        
        response = client.get("/lessons/category")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Python Basics"

    def test_update_category(self, test_db):
        # First create a category
        category_data = {
            "name": "Python Basics",
            "description": "Learn Python fundamentals"
        }
        create_response = client.post("/lessons/category", json=category_data)
        category_id = create_response.json()["id"]
        
        # Mock file data
        thumbnail_data = b"fake image data"
        files = {"thumbnail": ("test.jpg", thumbnail_data, "image/jpeg")}
        
        response = client.put(f"/lessons/category/{category_id}", files=files)
        
        assert response.status_code == 200

    def test_create_topic(self, test_db):
        # First create a category
        category_data = {
            "name": "Python Basics",
            "description": "Learn Python fundamentals"
        }
        category_response = client.post("/lessons/category", json=category_data)
        category_id = category_response.json()["id"]
        
        topic_data = {
            "name": "Variables",
            "description": "Learn about Python variables",
            "category_id": category_id
        }
        
        response = client.post("/lessons/topic/", json=topic_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Variables"
        assert data["category_id"] == category_id

    def test_get_topics_by_category(self, test_db):
        # Create category and topic
        category_data = {
            "name": "Python Basics",
            "description": "Learn Python fundamentals"
        }
        category_response = client.post("/lessons/category", json=category_data)
        category_id = category_response.json()["id"]
        
        topic_data = {
            "name": "Variables",
            "description": "Learn about Python variables",
            "category_id": category_id
        }
        client.post("/lessons/topic/", json=topic_data)
        
        response = client.get(f"/lessons/{category_id}/topics")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Variables"

    @patch('crud.create_lesson')
    def test_create_lesson_endpoint(self, mock_create_lesson, test_db):
        mock_lesson = models.Lesson(
            id=1,
            name="Test Lesson",
            text="Test content",
            example_code="print('hello')",
            expected_output="hello"
        )
        mock_create_lesson.return_value = mock_lesson
        
        lesson_data = {
            "name": "Test Lesson",
            "text": "Test content",
            "example_code": "print('hello')",
            "expected_output": "hello",
            "topic_id": "1",
            "display_index": 1
        }
        
        response = client.post("/lessons/lesson", json=lesson_data)
        
        assert response.status_code == 200
        mock_create_lesson.assert_called_once()

    def test_get_lesson_by_id(self, test_db):
        # This would require setting up a more complex test scenario
        # For now, test the endpoint exists
        response = client.get("/lessons/lesson/999")  # Non-existent ID
        
        # Should return 404 or handle gracefully
        assert response.status_code in [200, 404]

    def test_get_lessons(self, test_db):
        response = client.get("/lessons/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)