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
        const processedText = parseCodeBlocks(data.text);
        console.log(processedText)
        setLessonText(processedText);
        // After setting lesson text, highlight the code
        // Prism.highlightAll();
      })
      .catch((error) => {
        console.error('Error fetching lesson:', error);
      });
  };

  const parseCodeBlocks = (text) => {
    // Regex to identify pre elements and extract code content
    const preCodeBlockRegex = /<pre class="ql-syntax" spellcheck="false">([\s\S]+?)<\/pre>/g;
    return text.replace(preCodeBlockRegex, (match, codeContent) => {
      // Wrap the code content with code tags and remove class and spellcheck attributes
      const wrappedCode = `<pre class="language-python">${codeContent}</pre>`;
      return wrappedCode;
    });
  };

  return (
    <div className="lesson-component-container">
      <div className="lesson-article">
        <div dangerouslySetInnerHTML={{ __html: lessonText }}></div>
      </div>
    </div>
  );
};

export default LessonText;
