import React, { useEffect, useState } from 'react';
import SignUpLogin from './sign-up-login';
import './components.css';

const ProfileSmall = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/me/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`, // Pass the access token from the browser's local storage
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log(userData);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form submission logic here

    // Reload the page
    window.location.reload();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <h1>Log in to track your progress</h1>
        <div>
          <SignUpLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
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
