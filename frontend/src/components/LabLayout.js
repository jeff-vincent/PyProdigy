import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './video';
import IDE from './ide';
import LessonText from './lesson-text';
import { jwtDecode } from 'jwt-decode';
import './components.css';

const LabLayout = () => {
  const { labID } = useParams();
  const [orgID, setOrgId] = useState('');

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      console.error('JWT not found in localStorage');
      return;
    }

    let decodedJWT;
    try {
      decodedJWT = jwtDecode(jwt);
      setOrgId(decodedJWT.org_id);
    } catch (err) {
      console.error('Invalid JWT:', err);
      return;
    }

    const startComputeEnv = async () => {
      try {
        const response = await fetch('/compute/start', {
          method: 'GET', // TODO: Change to 'POST' and pass token in headers + body
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          // body: JSON.stringify({ org_id: decodedJWT.org_id, lab_id: labID }) // future POST
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Compute env started:', data);
      } catch (error) {
        console.error('Failed to start compute environment:', error);
      }
    };

    startComputeEnv();
  }, [labID]);

  return (
    <div className="grid-container">
      <div className="grid-item-left">
        <VideoPlayer lessonID={labID} />
        <IDE lessonID={labID} />
      </div>
      <div className="grid-item-right">
        <LessonText lessonID={labID} />
      </div>
    </div>
  );
};

export default LabLayout;
