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
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text;

    const codeElements = tempElement.getElementsByTagName('code');
    Array.from(codeElements).forEach((codeElement) => {
      Prism.highlightElement(codeElement);
    });

    const nonCodeText = Array.from(tempElement.childNodes).reduce((acc, node) => {
      if (node.nodeName === '#text') {
        const spanElement = document.createElement('span');
        spanElement.textContent = node.textContent;
        spanElement.className = 'non-code-text';
        acc.appendChild(spanElement);
      } else {
        acc.appendChild(node.cloneNode(true));
      }
      return acc;
    }, document.createDocumentFragment());

    const resultElement = document.createElement('div');
    resultElement.appendChild(nonCodeText);

    return resultElement.innerHTML;
  };

  return (
    <div className="lesson-article">
      <pre className="lesson-text">
        <code style={{ fontSize: '16px' }} dangerouslySetInnerHTML={{ __html: lessonText }}></code>
      </pre>
    </div>
  );
};

export default LessonText;
