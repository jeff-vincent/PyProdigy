import React from 'react';
import './components.css'; // Assuming you have a CSS file for video player styling

const VideoPlayer = ({ lessonID }) => {

  const videoUrl = `/video/stream/${lessonID}`;
  
return (
  <div className='video-container'>
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
