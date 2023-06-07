import React from 'react';
import './components.css'; // Assuming you have a CSS file for video player styling

const VideoPlayer = ({ lessonID }) => {
  const videoUrl = `http://localhost:8084/video/stream/${lessonID}`;
  
  return (
    <div className='video-container' style={{ paddingLeft: '0.5in' }}>
    <div className="video-player" style={{ width: '3in', height: '3in', marginLeft: '1in' }}>
      <video className="video" controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    </div>
  );
};

export default VideoPlayer;
