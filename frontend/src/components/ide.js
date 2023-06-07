import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-solarized_light';

const IDE = ({ lessonID }) => {
  const [fileContent, setFileContent] = useState('');
  const [outputFileContent, setOutputFileContent] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');

  useEffect(() => {
    // Fetch the lesson data from the /lesson/{lessonID} endpoint
    fetch(`http://localhost:8085/lesson/${lessonID}`)
      .then(response => response.json())
      .then(data => {
        // Set the sample code in state
        setFileContent(data.example_code);
        setExpectedOutput(data.expected_output)
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
        console.log(typeof content);
        const processedContent = content.replace(/\\n/g, "<br>").replace(/"/g, "");
        setOutputFileContent(processedContent); // Set the response content in state
  
        if (processedContent === expectedOutput) {
          setOutputFileContent("Success!"); // Set "Success!" if output matches expected output
        }
        if (processedContent != expectedOutput) {
          console.log(processedContent);
          console.log(expectedOutput)
        }
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
      <div dangerouslySetInnerHTML={{ __html: outputFileContent.replace(/\\n/g, "<br>").replace(/"/g, "") }} />
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
