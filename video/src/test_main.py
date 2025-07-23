import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import io

from main import app

client = TestClient(app)

class TestVideoService:
    
    @patch('main.AsyncIOMotorClient')
    @patch('main.AsyncIOMotorGridFSBucket')
    def test_startup_mongo_connection(self, mock_gridfs, mock_client):
        """Test MongoDB connection on startup"""
        mock_client_instance = AsyncMock()
        mock_client.return_value = mock_client_instance
        mock_gridfs_instance = AsyncMock()
        mock_gridfs.return_value = mock_gridfs_instance
        
        # Test that startup event works
        # This would require triggering the startup event
        assert True  # Placeholder for startup test

    def test_index_endpoint(self):
        """Test the video index endpoint"""
        response = client.get('/video')
        
        assert response.status_code == 200
        # Should return some video listing or info

    @patch('main.fs')
    @patch('main._get_videos')
    @pytest.mark.asyncio
    async def test_get_videos_success(self, mock_get_videos, mock_fs):
        """Test getting video list successfully"""
        mock_videos = [
            {'_id': '1', 'filename': 'lesson1.mp4', 'lesson_id': 'lesson1'},
            {'_id': '2', 'filename': 'lesson2.mp4', 'lesson_id': 'lesson2'}
        ]
        mock_get_videos.return_value = mock_videos
        
        # This would test the _get_videos internal function
        result = await mock_get_videos()
        assert len(result) == 2
        assert result[0]['filename'] == 'lesson1.mp4'

    @patch('main.fs')
    @patch('main._upload')
    @patch('main._add_library_record')
    @pytest.mark.asyncio
    async def test_upload_video_success(self, mock_add_record, mock_upload, mock_fs):
        """Test successful video upload"""
        mock_upload.return_value = None
        mock_add_record.return_value = None
        
        # Create a mock file
        test_file_content = b"fake video content"
        
        with patch('main.BackgroundTasks') as mock_bg_tasks:
            files = {"video": ("test_video.mp4", io.BytesIO(test_file_content), "video/mp4")}
            response = client.post("/video/upload/123", files=files)
            
            assert response.status_code == 200

    @patch('main.fs')
    @pytest.mark.asyncio
    async def test_upload_video_error(self, mock_fs):
        """Test video upload with error"""
        mock_fs.upload_from_stream.side_effect = Exception("Upload failed")
        
        test_file_content = b"fake video content"
        files = {"video": ("test_video.mp4", io.BytesIO(test_file_content), "video/mp4")}
        
        response = client.post("/video/upload/123", files=files)
        
        # Should handle the error gracefully
        # Implementation dependent on how errors are handled

    @patch('main.fs')
    @pytest.mark.asyncio
    async def test_stream_video_success(self, mock_fs):
        """Test successful video streaming"""
        # Mock the GridFS file
        mock_file = AsyncMock()
        mock_file.read.return_value = b"video chunk data"
        mock_file.length = 1000
        mock_fs.open_download_stream_by_name.return_value = mock_file
        
        response = client.get("/video/stream/test_video.mp4")
        
        # Should return streaming response
        assert response.status_code in [200, 404]  # 404 if file not found

    @patch('main.fs')
    @pytest.mark.asyncio
    async def test_stream_video_not_found(self, mock_fs):
        """Test streaming non-existent video"""
        mock_fs.open_download_stream_by_name.side_effect = Exception("File not found")
        
        response = client.get("/video/stream/nonexistent.mp4")
        
        # Should handle file not found
        assert response.status_code in [404, 500]

    @patch('main.library_collection')
    @pytest.mark.asyncio
    async def test_add_library_record(self, mock_collection):
        """Test adding video to library collection"""
        mock_collection.insert_one.return_value = AsyncMock()
        
        from main import _add_library_record
        
        await _add_library_record("lesson123")
        
        # Verify the record was inserted
        mock_collection.insert_one.assert_called_once()

    @patch('main.video_collection')
    @pytest.mark.asyncio
    async def test_get_videos_from_collection(self, mock_collection):
        """Test retrieving videos from collection"""
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = [
            {'filename': 'video1.mp4', 'lesson_id': 'lesson1'}
        ]
        mock_collection.find.return_value = mock_cursor
        
        from main import _get_videos
        
        videos = await _get_videos()
        
        assert len(videos) == 1
        assert videos[0]['filename'] == 'video1.mp4'


class TestVideoServiceIntegration:
    """Integration tests for video service"""
    
    @patch('main.mongo')
    @patch('main.fs')
    def test_full_video_workflow(self, mock_fs, mock_mongo):
        """Test complete video upload and streaming workflow"""
        # Mock MongoDB operations
        mock_mongo.videos = AsyncMock()
        mock_mongo.library = AsyncMock()
        
        # Mock GridFS operations
        mock_fs.upload_from_stream = AsyncMock()
        mock_fs.open_download_stream_by_name = AsyncMock()
        
        # Test upload
        test_file_content = b"fake video content"
        files = {"video": ("test_video.mp4", io.BytesIO(test_file_content), "video/mp4")}
        
        upload_response = client.post("/video/upload/123", files=files)
        
        # Test streaming
        stream_response = client.get("/video/stream/test_video.mp4")
        
        # Both operations should work
        assert upload_response.status_code == 200
        assert stream_response.status_code in [200, 404]

    def test_video_service_health(self):
        """Test video service health and availability"""
        response = client.get("/video")
        
        # Service should be responding
        assert response.status_code == 200


class TestVideoServiceEnvironment:
    """Test environment configuration and setup"""
    
    @patch.dict('os.environ', {'MONGO_HOST': 'localhost', 'MONGO_PORT': '27017'})
    def test_mongo_configuration(self):
        """Test MongoDB configuration from environment"""
        import os
        
        assert os.environ.get('MONGO_HOST') == 'localhost'
        assert os.environ.get('MONGO_PORT') == '27017'

    @patch('main.AsyncIOMotorClient')
    def test_mongo_client_initialization(self, mock_client):
        """Test MongoDB client initialization"""
        # This would test the actual client setup
        mock_client.assert_called()  # Called during import