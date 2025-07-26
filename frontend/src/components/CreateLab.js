import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth0 } from '@auth0/auth0-react';
import { jwtDecode } from 'jwt-decode';

const CreateLab = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [orgId, setOrgId] = useState(null);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchOrgId = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: 'urn:labthingy:api',
        });
        const decoded = jwtDecode(token);
        setOrgId(decoded['org_id']);
      } catch (error) {
        console.error('Failed to fetch organization ID:', error);
      }
    };
    fetchOrgId();
  }, [getAccessTokenSilently]);
  
  // UI Elements state
  const [selectedElements, setSelectedElements] = useState([]);
  const [lessonText, setLessonText] = useState('');
  const [exampleCode, setExampleCode] = useState('');
  const [terminalCommands, setTerminalCommands] = useState('');
  const [video, setVideo] = useState(null);

  const availableElements = [
    { id: 'LessonText', label: 'Lesson Text', description: 'Rich text content for the lab' },
    { id: 'IDE', label: 'IDE', description: 'Code editor with example code' },
    { id: 'Terminal', label: 'Terminal', description: 'Terminal commands and expected output' },
    { id: 'Video', label: 'Video', description: 'Instructional video content' }
  ];

  const handleElementToggle = (elementId) => {
    setSelectedElements(prev => {
      const isSelected = prev.includes(elementId);
      if (isSelected) {
        return prev.filter(id => id !== elementId);
      } else {
        return [...prev, elementId];
      }
    });
  };

  const isElementSelected = (elementId) => selectedElements.includes(elementId);
  const isValidSelection = selectedElements.length >= 2 && selectedElements.length <= 4;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidSelection) return;
    
    setLoading(true);

    const payload = {
      name: name,
      org_id: orgId,
      elements: selectedElements,
      lesson_text: isElementSelected('LessonText') ? lessonText : '',
      example_code: isElementSelected('IDE') ? exampleCode : '',
      terminal_commands: isElementSelected('Terminal') ? terminalCommands : '',
    };

    try {
      const response = await fetch(`/labs/lab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessTokenSilently({ audience: 'urn:labthingy:api' })}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const extractedLabID = data.id;

        if (video && isElementSelected('Video')) {
          const formData = new FormData();
          formData.append('video', video);

          await fetch(`/video/upload/${extractedLabID}`, {
            method: 'POST',
            body: formData
          });
        }

        // Reset form on success
        setName('');
        setLessonText('');
        setExampleCode('');
        setTerminalCommands('');
        setVideo(null);
        setSelectedElements([]);
      } else {
        throw new Error('Failed to submit form.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Lab Name
          </label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter Lab name"
            required
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Lab Components</h3>
          <p className="text-sm text-gray-600 mb-4">Choose between 2 and 4 components for your lab</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableElements.map((element) => (
              <div key={element.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={`element-${element.id}`}
                  checked={isElementSelected(element.id)}
                  onChange={() => handleElementToggle(element.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor={`element-${element.id}`} className="block text-sm font-medium text-gray-700 cursor-pointer">
                    {element.label}
                  </label>
                  <p className="text-xs text-gray-500">{element.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {!isValidSelection && selectedElements.length > 0 && (
            <p className="text-sm text-red-600 mt-2">
              Please select between 2 and 4 components (currently selected: {selectedElements.length})
            </p>
          )}
        </div>

        {/* Lesson Text Section */}
        <div className={`space-y-4 p-4 border rounded-lg transition-all duration-200 ${
          isElementSelected('LessonText') ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <h4 className={`text-md font-medium ${isElementSelected('LessonText') ? 'text-gray-900' : 'text-gray-400'}`}>
              Lesson Text Content
            </h4>
            {isElementSelected('LessonText') && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="lessonText" className={`block text-sm font-medium ${isElementSelected('LessonText') ? 'text-gray-700' : 'text-gray-400'}`}>
              Lesson Content
            </label>
            <div className={`border rounded-lg overflow-hidden ${isElementSelected('LessonText') ? 'border-gray-300' : 'border-gray-200'}`}>
              <ReactQuill 
                id="lessonText" 
                value={lessonText} 
                onChange={setLessonText}
                readOnly={!isElementSelected('LessonText')}
                className={isElementSelected('LessonText') ? 'bg-white' : 'bg-gray-100'}
                theme="snow"
                style={{ minHeight: '150px' }}
              />
            </div>
          </div>
        </div>

        {/* IDE Section */}
        <div className={`space-y-4 p-4 border rounded-lg transition-all duration-200 ${
          isElementSelected('IDE') ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <h4 className={`text-md font-medium ${isElementSelected('IDE') ? 'text-gray-900' : 'text-gray-400'}`}>
              IDE Content
            </h4>
            {isElementSelected('IDE') && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="exampleCode" className={`block text-sm font-medium ${isElementSelected('IDE') ? 'text-gray-700' : 'text-gray-400'}`}>
              Example Code
            </label>
            <textarea 
              id="exampleCode" 
              value={exampleCode} 
              onChange={(e) => setExampleCode(e.target.value)} 
              disabled={!isElementSelected('IDE')}
              rows="6"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-sm ${
                isElementSelected('IDE') ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
              placeholder="Enter example code..."
            />
          </div>
        </div>

        {/* Terminal Section */}
        <div className={`space-y-4 p-4 border rounded-lg transition-all duration-200 ${
          isElementSelected('Terminal') ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <h4 className={`text-md font-medium ${isElementSelected('Terminal') ? 'text-gray-900' : 'text-gray-400'}`}>
              Terminal Content
            </h4>
            {isElementSelected('Terminal') && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="terminalCommands" className={`block text-sm font-medium ${isElementSelected('Terminal') ? 'text-gray-700' : 'text-gray-400'}`}>
              Terminal Commands & Expected Output
            </label>
            <textarea 
              id="terminalCommands" 
              value={terminalCommands} 
              onChange={(e) => setTerminalCommands(e.target.value)} 
              disabled={!isElementSelected('Terminal')}
              rows="4"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-sm ${
                isElementSelected('Terminal') ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
              placeholder="Enter terminal commands and expected output..."
            />
          </div>
        </div>

        {/* Video Section */}
        <div className={`space-y-4 p-4 border rounded-lg transition-all duration-200 ${
          isElementSelected('Video') ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <h4 className={`text-md font-medium ${isElementSelected('Video') ? 'text-gray-900' : 'text-gray-400'}`}>
              Video Content
            </h4>
            {isElementSelected('Video') && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="video" className={`block text-sm font-medium ${isElementSelected('Video') ? 'text-gray-700' : 'text-gray-400'}`}>
              Video File
            </label>
            <input 
              type="file" 
              id="video" 
              onChange={(e) => setVideo(e.target.files[0])} 
              disabled={!isElementSelected('Video')}
              accept="video/*"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium ${
                isElementSelected('Video') 
                  ? 'border-gray-300 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100' 
                  : 'border-gray-200 bg-gray-100 file:bg-gray-100 file:text-gray-400'
              }`}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !name.trim() || !isValidSelection}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Lab...
            </>
          ) : (
            'Create Lab'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateLab;
