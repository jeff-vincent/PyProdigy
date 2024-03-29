import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-solarized_light';
import './components.css';

const IDE = ({ lessonID }) => {
  const [fileContent, setFileContent] = useState('');
  const [outputFileContent, setOutputFileContent] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getAccessTokenSilently, user } = useAuth0();

  useEffect(() => {
    // Fetch the lesson data from the /lesson/{lessonID} endpoint
    fetch(`/lessons/lesson/${lessonID}`)
      .then((response) => response.json())
      .then((data) => {
        // Set the sample code in state
        setFileContent(data.example_code);
        setExpectedOutput(data.expected_output.replace(/'/g, ''));
        setLessonName(data.name);
      })
      .catch((error) => {
        console.error('Error fetching lesson:', error);
      });
  }, [lessonID]);

  const handleFileContentChange = (value) => {
    setFileContent(value);
  };

    const handleRunCode = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('script', fileContent);
    const accessToken = await getAccessTokenSilently();
    const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

    try {
      const response = await fetch(`/compute/run`, {
        method: 'POST',
        body: formData,
        headers: headers,
      });

      if (response.ok) {
        const rawContent = await response.text();
        const sections = rawContent.split('\n');

        const htmlContent = `<div>${rawContent}</div>`
        console.log('processed content:', htmlContent);
        console.log('expected output:', expectedOutput)

        setOutputFileContent(htmlContent);
        const podTerminated = "Error from server (NotFound):"
        if (htmlContent.includes(podTerminated)) {
          setOutputFileContent('<b>Your cloud environment needs to be restarted.\nCopy any code you\'d like to save and refresh your browser to continue.</b>');
        }

        if (htmlContent === expectedOutput) {
          setShowModal(true);

          const data = {
            lesson_id: lessonID,
            name: lessonName,
          };

          const completionResponse = await fetch(`/api/completed-lesson`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(data),
          });

          if (!completionResponse.ok) {
            console.error('Failed to complete lesson.');
          }
        }
      } else {
        throw new Error('Failed to run code.');
      }
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="lesson-component-container">
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
        <div dangerouslySetInnerHTML={{ __html: outputFileContent.replace(/\\n/g, '<br>').replace(/"/g, '') }} />
      </div>

      <div className="ide-actions">
        <button onClick={handleRunCode} className="ide-button" disabled={loading}>
          {loading ? 'Running...' : 'Run'}
        </button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCloseModal}>X</button>
            <h2>Congratulations!</h2>
            <p>You have successfully completed the lesson. 🎉</p>
            <p>🎇🎆🎉🎊</p>
            <button className="ide-button" onClick={() => window.location.href = '/topics'}>
              Ready for another lesson? 💪
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDE;
