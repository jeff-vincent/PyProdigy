import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-solarized_light';

const IDE = ({ lessonID }) => {
  const [fileContent, setFileContent] = useState('');
  const [outputFileContent, setOutputFileContent] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/lessons/lesson/${lessonID}`)
      .then((response) => response.json())
      .then((data) => {
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
    const accessToken = localStorage.getItem('jwt');
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
        const htmlContent = `<div>${rawContent}</div>`;
        
        setOutputFileContent(htmlContent);
        const podTerminated = "Error from server (NotFound):";
        
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Code Editor Section */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          Python Editor
        </h3>
      </div>
      
      <div className="p-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
          <AceEditor
            mode="python"
            theme="solarized_light"
            value={fileContent}
            onChange={handleFileContentChange}
            name="code-editor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="300px"
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 4,
            }}
          />
        </div>

        {/* Run Button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleRunCode} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m3-16l3 3-3 3m-6-6l-3 3 3 3" />
                </svg>
                Run Code
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {outputFileContent && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-green-300 font-semibold">Output:</span>
            </div>
            <div 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: outputFileContent.replace(/\\n/g, '<br>').replace(/"/g, '') 
              }} 
            />
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-pulse">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={handleCloseModal}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations! 🎉</h2>
              <p className="text-gray-600 mb-4">You have successfully completed the lesson!</p>
              <div className="text-3xl mb-6">🎇🎆🎉🎊</div>
              
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 w-full"
                onClick={() => window.location.href = '/topics'}
              >
                Ready for another lesson? 💪
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDE;
