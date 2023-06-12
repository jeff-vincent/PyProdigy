import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import SignUpLogin from './sign-up-login';
import './components.css';

const ProfileFull = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/me/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
          credentials: 'include',
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

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');

    if (user) {
      const labels = user.completed_lessons.map((completed_lesson) => completed_lesson.name);
      const data = user.completed_lessons.map((completed_lesson) => completed_lesson.progress);

      const chartData = {
        labels,
        datasets: [
          {
            label: 'Lesson Progress',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            data,
          },
        ],
      };

      const newChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      });

      setChart(newChart);
    }
  }, [user]);

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
      <div className="dashboard-info">
        <canvas ref={chartRef} />
      </div>
      <div className="profile-completed-lessons">
        <p>Completed Lessons: {user.completed_lessons.length}</p>
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

export default ProfileFull;
