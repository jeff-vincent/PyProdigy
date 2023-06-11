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
        // Set the lesson text in state
        setLessonText(data.text);
        highlightCode();
      })
      .catch((error) => {
        console.error('Error fetching lesson:', error);
      });
  };

  const highlightCode = () => {
    if (lessonTextRef.current) {
      const codeElements = lessonTextRef.current.querySelectorAll('code');
      codeElements.forEach((codeElement) => {
        Prism.highlightElement(codeElement);
      });
    }
  };

  return (
    <div className="lesson-article">
      <pre className="lesson-text" ref={lessonTextRef} style={lessonTextStyle}>
        {lessonText}
      </pre>
    </div>
  );
};

const lessonTextStyle = {
  background: '#f4f4f4',
  padding: '1em',
  borderRadius: '4px',
  fontFamily: 'Consolas, monospace',
  fontSize: '14px',
  lineHeight: '1.5',
  overflowX: 'auto',
};

export default LessonText;
