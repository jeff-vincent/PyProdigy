import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './components.css';

const Topics = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);

  const BASE_URL = process.env.BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/lessons/category`);
        const data = await response.json();
        console.log(data);
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  if (!categories) {
    return <div>Loading...</div>;
  }

  // Organize lessons by category and topic
  const organizedCategories = {};
  categories.forEach(category => {
    category.topics.forEach(topic => {
      if (!organizedCategories[category.name]) {
        organizedCategories[category.name] = {};
      }
      if (!organizedCategories[category.name][topic.name]) {
        organizedCategories[category.name][topic.name] = [];
      }
      organizedCategories[category.name][topic.name] = organizedCategories[category.name][topic.name].concat(topic.lessons);
    });
  });

  return (
    <div className="topics-grid">
      {Object.entries(organizedCategories).map(([categoryName, topics]) => (
        <div key={categoryName} className="category-column">
          <h3 className="category-name">{categoryName}</h3>
          {Object.entries(topics).map(([topicName, lessons]) => (
            <div key={topicName} className="topic-section">
              <h4 className="topic-name">{topicName}</h4>
              <ul className="lessons-list">
                {lessons.map((lesson) => (
                  <li key={lesson.id} className="lesson-item">
                    <a href={`/learn/${lesson.id}`} className="lesson-tile">{lesson.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Topics;
