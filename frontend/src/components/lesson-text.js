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
        // Apply text highlighting
        const highlightedText = highlightCode(data.text);
        // Set the highlighted lesson text in state
        setLessonText(highlightedText);
      })
      .catch((error) => {
        console.error('Error fetching lesson:', error);
      });
  };

  const highlightCode = (text) => {
    // Match text within backticks and apply Prism highlighting
    const highlightedText = text.replace(/`([^`]+)`/g, (match, p1) => {
      const highlightedCode = Prism.highlight(p1, Prism.languages.javascript, 'python');
      return `<span style="font-family: 'Courier New', Courier, monospace; font-weight: bold;">${highlightedCode}</span>`;
    });

    return highlightedText;
  };

  return (
    <div className="lesson-article-container">
      <div className="lesson-article">
        <pre className="lesson-text" dangerouslySetInnerHTML={{ __html: lessonText }}></pre>
      </div>
    </div>
  );
};

export default LessonText;
