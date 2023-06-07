import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Topics = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8085/category`);

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
      {imageURL && <img src={imageURL} alt="Topic" />}
      <ul className="topics-list">
        {categories.map((category) => (
          <li key={category.id} className="topic-item">
            {category.name}
            {category.topics.length > 0 && (
              <ul className="subtopics-list">
                {category.topics.map((topic) => (
                  <li key={topic.id} className="subtopic-item">
                    {topic.name}
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
          </li>
        ))}
      </ul>
    </div>
  );  
};  

export default Topics;
