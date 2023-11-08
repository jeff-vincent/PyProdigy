import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './video';
import IDE from './ide';
import LessonText from "./lesson-text";
import './components.css';
import withAuth from './withAuth'

const Grid = ({}) => {
  const { lessonID } = useParams();
  const [lessonName, setLessonName] = useState('');

  // Fetch lesson data
  useEffect(() => {


    const fetchLessonData = async () => {
      try {
        const response = await fetch(`/lessons/lesson/${lessonID}/`);
        if (response.ok) {
          const lessonData = await response.json();
          setLessonName(lessonData.name);
        } else {
          console.error('Error:', response.status);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchLessonData();
  }, [lessonID]);

  return (
    <div className="grid-container">
      <div className="grid-item-left">
        <VideoPlayer lessonID={lessonID}/>
        <IDE lessonID={lessonID} />
      </div>
      <div className="grid-item-right">
        <LessonText lessonID={lessonID}/>
      </div>
    </div>
  );
};

export default withAuth(Grid);
