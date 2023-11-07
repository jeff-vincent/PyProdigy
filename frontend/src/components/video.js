import React from 'react';
import './components.css'; // Assuming you have a CSS file for video player styling

const VideoPlayer = ({ lessonID, accessToken }) => {

  const videoUrl = `/video/stream/${lessonID}`;
  
return (
  <div className='lesson-component-container' style={{ marginBottom: '25px' }}>
    <div className="video-player">
      <video className="video" controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
);
};

export default VideoPlayer;
