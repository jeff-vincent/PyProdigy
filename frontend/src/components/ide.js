import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-solarized_light';

const IDE = ({ lessonID }) => {
  const [sampleCode, setSampleCode] = useState('');

  useEffect(() => {
    // Fetch the lesson data from the /lesson/{lessonID} endpoint
    fetch(`http://localhost:8085/lesson/${lessonID}`)
      .then(response => response.json())
      .then(data => {
        // Set the sample code in state
        setSampleCode(data.example_code);
        console.log(data.example_code);
      })
      .catch(error => {
        console.error('Error fetching lesson:', error);
      });
  }, [lessonID]);

  const handleFileContentChange = (value) => {
    // Handle the file content change here
  };

  const handleRunCode = () => {
    // Handle running the code here
  };

  return (
    <div className="ide-container">
      <AceEditor
        mode="python"
        theme="solarized_light"
        value={sampleCode}
        onChange={handleFileContentChange}
        name="code-editor"
        editorProps={{ $blockScrolling: true }}
        width="100%"
        height="300px"
      />
      <div className="ide-actions">
        <button onClick={handleRunCode} className="ide-button">
          Run
        </button>
      </div>
    </div>
  );
};

export default IDE;
