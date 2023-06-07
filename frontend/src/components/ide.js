import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-solarized_light';

const IDE = ({ lessonID }) => {
  const [fileContent, setFileContent] = useState('');
  const [outputFileContent, setOutputFileContent] = useState('');

  useEffect(() => {
    // Fetch the lesson data from the /lesson/{lessonID} endpoint
    fetch(`http://localhost:8085/lesson/${lessonID}`)
      .then(response => response.json())
      .then(data => {
        // Set the sample code in state
        setFileContent(data.example_code);
      })
      .catch(error => {
        console.error('Error fetching lesson:', error);
      });
  }, [lessonID]);

  const handleFileContentChange = (value) => {
    setFileContent(value);
  };

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
