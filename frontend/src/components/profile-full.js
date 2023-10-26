import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import withAuth from "./withAuth";
import "./components.css"; // Import your CSS file for styling

const Profile = ({ userID }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/get-completed-lessons-by-id/${userID}`);
        if (response.ok) {
          const completedLessons = await response.json();
          setUserData(completedLessons);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (isAuthenticated && userID) {
      fetchData();
    }
  }, [isAuthenticated, userID]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  // Generate an array of dates for the last 100 days
  const currentDate = new Date();
  const last100DaysDates = Array.from({ length: 100 }, (_, index) => {
    const date = new Date();
    date.setDate(currentDate.getDate() - index);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  });

  return (
  isAuthenticated && (
      <div>
    <div className="profile-container">
      <div className="profile-header">
        <img
            src={user.picture}
            alt={user.name}
            className="profile-picture"
          />
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>
      </div>
      <div>
      <h1>Track your progress 💪</h1>
        </div>
      <div>
      <div className="profile-grid">
        {last100DaysDates.map((date) => {
          const completedLessonsOnDate = userData
            ? userData.filter((lesson) => lesson.completedDate.split("T")[0] === date)
            : [];

          return (
            <div
              key={date}
              className={`profile-grid-item ${
                completedLessonsOnDate.length > 0 ? "completed-lesson" : "incomplete-lesson"
              }`}
              title={
                completedLessonsOnDate.length > 0
                  ? completedLessonsOnDate.map((lesson) => lesson.lessonName).join(", ")
                  : "None"
              }
            ></div>
          );
        })}
      </div>
    </div>
    </div>
  )
);
};

export default withAuth(Profile);
