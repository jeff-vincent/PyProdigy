import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

const LessonText = ({ lessonID }) => {
  const [lessonText, setLessonText] = useState('');
  const [loading, setLoading] = useState(true);
  const lessonTextRef = useRef(null);

  useEffect(() => {
    fetchLessonText();
  }, [lessonID]);

  const fetchLessonText = () => {
    // Fetch the lesson data from the /lesson/{lessonID} endpoint
    fetch(`/lessons/lesson/${lessonID}`)
      .then((response) => response.json())
      .then((data) => {
        const processedText = parseCodeBlocks(data.text);
        setLessonText(processedText);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching lesson:', error);
        setLoading(false);
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
          Lesson Content
        </h3>
      </div>
      
      <div className="p-6">
        <div 
          ref={lessonTextRef}
          className="prose prose-lg max-w-none
            prose-headings:text-gray-800 prose-headings:font-semibold
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-strong:text-gray-800
            prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-900 prose-pre:text-green-400 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-ul:text-gray-700 prose-ol:text-gray-700
            prose-li:text-gray-700
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: lessonText }}
        />
      </div>
    </div>
  );
};

export default LessonText;
