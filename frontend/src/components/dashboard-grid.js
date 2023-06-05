import React from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './video';
import ProfileSmall from './profile-small';
import Terminal from './terminal';
import IDE from './ide';
import './components.css';

const Grid = () => {
  const { lessonID } = useParams();
  console.log(lessonID);

  return (
    <div className="grid-container">
      <div className="">
        <VideoPlayer lessonID={lessonID} />
      </div>
      <div className="">
        <ProfileSmall lessonID={lessonID} />
      </div>
      <div className="">
        <IDE lessonID={lessonID} />
      </div>
      <div className="">
        <Terminal lessonID={lessonID} />
      </div>
    </div>
  );
};

export default Grid;
