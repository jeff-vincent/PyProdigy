import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import withAuth from "./withAuth";
import "./components.css"; // Import your CSS file for styling

const Profile = () => {
  const { getAccessTokenSilently, user, isAuthenticated, isLoading } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = await getAccessTokenSilently();

      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };
        const response = await fetch(`/api/get-completed-lessons`, {
          method: "GET",
          headers: headers,
        });
        if (response.ok) {
          const completedLessons = await response.json();
          console.log(completedLessons)
          setUserData(completedLessons);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      try {
        const response = await fetch(`/lessons/category`);
        const data = await response.json();
        console.log(data);
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

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

  const getTopicProgress = (topicId) => {
    const completedLessonsInTopic = userData
      ? userData.filter((lesson) =>
          categories.some((category) =>
            category.topics.some((topic) =>
              topic.lessons.some((categoryLesson) =>
                categoryLesson.name === lesson.lessonName
              )
            )
          )
        )
      : [];

    const totalLessonsInTopic = categories
      .flatMap((category) => category.topics)
      .find((topic) => topic.id === topicId)?.lessons.length || 0;

    return (
      (completedLessonsInTopic.length / totalLessonsInTopic) * 100 || 0
    );
  };

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
        <h3>Lessons completed in the past 💯 days</h3>
        <div className="profile-grid">
          {last100DaysDates.map((date) => {
            const completedLessonsOnDate = userData
              ? userData.filter(
                  (lesson) => lesson.completedDate.split("T")[0] === date
                )
              : [];

            return (
              <div
                key={date}
                className={`profile-grid-item ${
                  completedLessonsOnDate.length > 0
                    ? "completed-lesson"
                    : "incomplete-lesson"
                }`}
                title={
                  completedLessonsOnDate.length > 0
                    ? completedLessonsOnDate
                        .map((lesson) => lesson.lessonName)
                        .join(", ")
                    : "None"
                }
              ></div>
            );
          })}
        </div>
        <div>
          <h2>Your topics</h2>
          {categories.flatMap((category) =>
            category.topics.map((topic) => (
              <div key={topic.id} className="profile-topic">
                <h3>{topic.name}</h3>
                <div
                  key={topic.id}
                  title={`Progress: ${getTopicProgress(topic.id)}%`}
                >
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${getTopicProgress(topic.id)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  );
};

export default withAuth(Profile);
