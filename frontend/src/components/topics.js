import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Topics = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [imageURL, setImageURL] = useState('');

  const BASE_URL = process.env.BASE_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/lessons/category`);

        const data = await response.json();

        setCategories(data);

        // Convert base64 image data to URL
        if (data.image) {
          const base64Image = data.image; // Replace with the property that contains your base64 encoded image data
          const imageUrl = `data:image/jpeg;base64, ${base64Image}`;
          setImageURL(imageUrl);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  if (!categories) {
    return <div>Loading...</div>;
  }
  return (
    <div className="topics-grid">
      {categories.map((category) => (
        <div key={category.id} className="category-item">
          {category.thumbnail && <img src={category.thumbnail} alt="Thumbnail" />}
          <h3 className="category-name">{category.name}</h3>
          {category.topics.length > 0 && (
            <ul className="subtopics-list">
              {category.topics.map((topic) => (
                <li key={topic.id} className="subtopic-item">
                  {topic.thumbnail && <img src={topic.thumbnail} alt="Thumbnail" />}
                  <h4 className="subtopic-name">{topic.name}</h4>
                  {topic.lessons.length > 0 && (
                    <ul className="lessons-list">
                      {topic.lessons.map((lesson) => (
                        <li key={lesson.id} className="lesson-item">
                          <a href={`/learn/${lesson.id}`}>{lesson.name}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};  

export default Topics;
