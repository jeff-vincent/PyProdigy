import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

const LessonText = ({ lessonID }) => {
  const [lessonText, setLessonText] = useState('');
  const lessonTextRef = useRef(null);

  useEffect(() => {
    fetchLessonText();
  }, [lessonID]);

  const fetchLessonText = () => {
    // Fetch the lesson data from the /lesson/{lessonID} endpoint
    fetch(`/lessons/lesson/${lessonID}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setLessonText(data.text)
      })
      .catch((error) => {
        console.error('Error fetching lesson:', error);
      });
  };

  return (
    <div className="lesson-component-container">
      <div className="lesson-article">
        <pre className="lesson-text" dangerouslySetInnerHTML={{ __html: lessonText }}></pre>
      </div>
    </div>
  );
};

export default LessonText;
