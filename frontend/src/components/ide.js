import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-solarized_light';

const IDE = ({ lessonID }) => {
  const [fileContent, setFileContent] = useState('');
  const [outputFileContent, setOutputFileContent] = useState('');
  const [highlightedContent, setHighlightedContent] = useState('');

  const handleFileContentChange = (value) => {
    setFileContent(value);
    setHighlightedContent(value);
  };

  console.log('example code id');
  console.log(lessonID);

  useEffect(() => {
    // Apply syntax highlighting when fileContent changes
    setHighlightedContent(fileContent);
  }, [fileContent]);

  // You can replace this with your own syntax highlighting logic
  const highlightSyntax = (content) => {
    // Here, we're just returning the content as-is
    // Replace this with your own syntax highlighting logic
    return content;
  };

  useEffect(() => {
    // Apply syntax highlighting to the textarea
    const highlightedText = highlightSyntax(fileContent);
    setHighlightedContent(highlightedText);
  }, [fileContent]);

  const handleRunCode = () => {
    const formData = new FormData();
    formData.append('script', fileContent);

    fetch('http://localhost:8081/build', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (response.ok) {
          return response.text(); // Read the response as text
        } else {
          throw new Error('Failed to run code.');
        }
      })
      .then(content => {
        setOutputFileContent(content); // Set the response content in state
      })
      .catch(error => {
        console.error('Error running code:', error);
      });
  };

  useEffect(() => {
    // Render the response content when it updates
    if (outputFileContent !== '') {
      // Display the response content
      console.log('Response content:', outputFileContent);
    }
  }, [outputFileContent]);

  return (
    <div className="ide-container">
      <AceEditor
        mode="python"
        theme="solarized_light"
        value={fileContent}
        onChange={handleFileContentChange}
        name="code-editor"
        editorProps={{ $blockScrolling: true }}
        width="100%"
        height="300px"
      />
      <div className="ide-response">
        {outputFileContent}
      </div>
      <div className="ide-actions">
        <button onClick={handleRunCode} className="ide-button">
          Run
        </button>
      </div>
    </div>
  );
};

export default IDE;
