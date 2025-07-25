import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditLab = () => {
  const [categories, setCategories] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [exampleCode, setExampleCode] = useState('');
  const [video, setVideo] = useState(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch(`/lessons/category`);
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleLessonSelectChange = (event) => {
    const selectedId = event.target.value;
    setSelectedLessonId(selectedId);

    if (selectedId) {
      fetch(`/lessons/lesson/${selectedId}`)
        .then((response) => response.json())
        .then((data) => {
          setLessonText(data.text);
          setLessonName(data.name);
          setExpectedOutput(data.expected_output);
          setExampleCode(data.example_code);
          setDisplayIndex(data.display_index);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setLessonText('');
      setLessonName('');
      setExpectedOutput('');
      setExampleCode('');
      setDisplayIndex(0);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      id: selectedLessonId,
      example_code: exampleCode,
      text: lessonText,
      name: lessonName,
      expected_output: expectedOutput,
      display_index: displayIndex,
    };

    try {
      const response = await fetch(`/lessons/lesson/${selectedLessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (video) {
          const formData = new FormData();
          formData.append('video', video);

          await fetch(`/video/upload/${selectedLessonId}`, {
            method: 'POST',
            body: formData,
          });
        }
        
        // Success feedback could be added here
        console.log('Lesson updated successfully');
      } else {
        throw new Error('Failed to update lesson.');
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
        <div className="space-y-2">
          <label htmlFor="lessonDropdown" className="block text-sm font-medium text-gray-700">
            Select a Lesson
          </label>
          <select
            id="lessonDropdown"
            onChange={handleLessonSelectChange}
            value={selectedLessonId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            required
          >
            <option value="">Select a lesson to edit</option>
            {categories.map((category) =>
              category.topics?.map((topic) =>
                topic.lessons?.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {category.name} → {topic.name} → {lesson.name}
                  </option>
                ))
              )
            )}
          </select>
        </div>

        {selectedLessonId && (
          <>
            <div className="space-y-2">
              <label htmlFor="lessonName" className="block text-sm font-medium text-gray-700">
                Lesson Name
              </label>
              <input
                type="text"
                id="lessonName"
                value={lessonName}
                onChange={(event) => setLessonName(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter lesson name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="display-index" className="block text-sm font-medium text-gray-700">
                Display Index
              </label>
              <input 
                type="number" 
                id="display-index" 
                value={displayIndex} 
                onChange={(event) => setDisplayIndex(event.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lessonText" className="block text-sm font-medium text-gray-700">
                Lesson Text
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <ReactQuill
                  id="lessonText"
                  value={lessonText}
                  onChange={setLessonText}
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
                onChange={(event) => setExampleCode(event.target.value)}
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
                onChange={(event) => setExpectedOutput(event.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-sm"
                placeholder="Enter expected output..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="video" className="block text-sm font-medium text-gray-700">
                Update Video (Optional)
              </label>
              <input
                type="file"
                id="video"
                onChange={(event) => setVideo(event.target.files[0])}
                accept="video/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !lessonName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default EditLab;
