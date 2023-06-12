import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './video';
import ProfileSmall from './profile-small';
import Terminal from './terminal';
import IDE from './ide';
import './components.css';
import UserIDContext from './userContext';
import LessonText from "./lesson-text";

const Grid = () => {
  const { lessonID } = useParams();
  const [userID, setUserID] = useState(null);
  const [lessonName, setLessonName] = useState('')

  const BASE_URL = process.env.BASE_URL

  useEffect(() => {
    // Fetch the user data and retrieve the userID
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserID(userData.id);
        } else {
          console.error('Error:', response.status);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

    useEffect(() => {
    // Fetch the user data and retrieve the userID
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
  }, []);

  return (
      <div>
      <h1>{lessonName}</h1>
    <UserIDContext.Provider value={userID}>
      <div className="grid-container">
        <div className="">
          <VideoPlayer lessonID={lessonID} />
        </div>
        <div className="">
          <ProfileSmall lessonID={lessonID} />
        </div>
        <div className="">
          <IDE lessonID={lessonID} userID={userID}/>
        </div>
        <div className="">
          <LessonText lessonID={lessonID}/>
        </div>
      </div>
    </UserIDContext.Provider>
        </div>
  );
};

export default Grid;
