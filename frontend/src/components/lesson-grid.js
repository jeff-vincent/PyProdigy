import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './video';
import IDE from './ide';
import './components.css';

const Grid = ({userID}) => {
  console.log('UserID in the Grid component:', userID)
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
    <div>
      <h1>{lessonName}</h1>
      {/* Your other components */}
      <VideoPlayer lessonID={lessonID} />
      <IDE lessonID={lessonID} userID={userID} />
      {/* Other components */}
    </div>
  );
};

export default Grid;
