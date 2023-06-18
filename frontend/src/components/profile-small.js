import React, { useEffect, useState } from 'react';
import SignUpLogin from './sign-up-login';
import './components.css';

const ProfileSmall = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log(userData.completed_lessons);
        } else {
          console.error('Error:', response.status);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const userId = user.id; // Capture the user ID before setting the user state to null

      const response = await fetch(`/api/logout`, {
        method: 'GET',
      });

      if (response.ok) {
        // Clear user data and perform any necessary actions after successful logout
        setUser(null);

        // Perform delete_container request using the captured user ID
        const deleteContainerResponse = await fetch(`/compute/delete/${userId}`);
        // Check deleteContainerResponse and handle accordingly
        console.log(deleteContainerResponse.stderr)
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <h1>Log in to get started</h1>
        <div>
          <SignUpLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="logout-button">
        <button onClick={handleLogout}>Logout</button>
      </div>
      <h2 className="dashboard-title">Welcome, {user.email}!</h2>
      <div className="dashboard-info"></div>
      <div className="profile-small-lessons">
        <p className="profile-small-lessons-title">Completed lessons:</p>
        <ul className="profile-small-lessons-list">
          {user.completed_lessons.map((completed_lesson) => (
            <li key={completed_lesson.id} className="profile-small-lessons-item">
              {completed_lesson.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileSmall;
