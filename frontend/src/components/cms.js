import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './components.css';
import CreateLesson from './create-lesson';
import CreateCategory from './create-category';
import CreateTopic from './create-topic';
import withAuth from './withAuth';
import EditLesson from "./edit-lesson";

const CMS = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const authorizeAdmin = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`/authenticate/get-user-roles/${accessToken}`);
        const data = await response.json();
        setIsAuthorized(data);
      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    authorizeAdmin();
  }, [getAccessTokenSilently]);

  if (!isAuthorized) {
    return <div></div>;
  }

  return (
    <div className="cms-container">
      <div className="cms-grid-item">
        <CreateCategory />
      </div>
      <div className="cms-grid-item">
        <CreateTopic />
      </div>
      <div className="cms-grid-item">
        <CreateLesson />
      </div>
        <div className="cms-grid-item">
        <EditLesson />
      </div>
    </div>
  );
};

export default withAuth(CMS);
