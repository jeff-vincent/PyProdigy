import React, { useEffect, useState } from 'react';
import SignUpLogin from './sign-up-login'
import './components.css';


const ProfileFull = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.BASE_URL

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`, // Pass the access token from the browser's local storage
          },
          credentials: 'include', // Include cookies in the request
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div><h1>Log in to track your progress</h1>
    <div><SignUpLogin/></div></div>)
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Welcome, {user.email}!</h2>
      <div className="dashboard-info">
      </div>
      <div className="dashboard-pets">
        <p className="pets-title">Completed lessons:</p>
        <ul className="pets-list">
          {user.pets.map((pet) => (
            <li key={pet.id} className="pet-item">
              {pet.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}  

export default ProfileFull;
