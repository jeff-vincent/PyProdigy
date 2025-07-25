import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateLab = () => {
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState(null);
  const [exampleCode, setExampleCode] = useState('');
  const [LabText, setLabText] = useState('');
  const [name, setName] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');



  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      example_code: exampleCode,
      text: LabText,
      name,
      expected_output: expectedOutput,
      display_index: displayIndex,
    };

    try {
      const response = await fetch(`/labs/lab/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const extractedLabID = data.id;

        if (video) {
          const formData = new FormData();
          formData.append('video', video);

          await fetch(`/video/upload/${extractedLabID}`, {
            method: 'POST',
            body: formData
          });
        }

        // Reset form on success
        setName('');
        setExampleCode('');
        setLabText('');
        setExpectedOutput('');
        setDisplayIndex(0);
        setVideo(null);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


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

          <div className="space-y-2">
            <label htmlFor="video" className="block text-sm font-medium text-gray-700">
              Video
            </label>
            <input 
              type="file" 
              id="video" 
              onChange={(e) => setVideo(e.target.files[0])} 
              accept="video/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="labText" className="block text-sm font-medium text-gray-700">
            Lab Text
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <ReactQuill 
              id="labText" 
              value={LabText} 
              onChange={setLabText}
              className="bg-white"
              theme="snow"
              style={{ minHeight: '150px' }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="exampleCode" className="block text-sm font-medium text-gray-700">
            Example Code
          </label>
          <textarea 
            id="exampleCode" 
            value={exampleCode} 
            onChange={(e) => setExampleCode(e.target.value)} 
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-sm"
            placeholder="Enter example code..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expectedOutput" className="block text-sm font-medium text-gray-700">
            Expected Output
          </label>
          <textarea 
            id="expectedOutput" 
            value={expectedOutput} 
            onChange={(e) => setExpectedOutput(e.target.value)} 
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-sm"
            placeholder="Enter expected output..."
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !name.trim()}
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
