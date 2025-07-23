import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateLesson = () => {
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState(null);
  const [exampleCode, setExampleCode] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [topicID, setTopicID] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [expectedOutput, setExpectedOutput] = useState('');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetch(`/lessons/category`)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    
    if (categoryId) {
      fetch(`/lessons/${categoryId}/topics`)
        .then(response => response.json())
        .then(data => {
          setTopics(data);
        })
        .catch(error => console.error('Error fetching topics:', error));
    } else {
      setTopics([]);
    }
    setTopicID('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      example_code: exampleCode,
      text: lessonText,
      name,
      topic_id: topicID,
      expected_output: expectedOutput,
      display_index: displayIndex,
    };

    try {
      const response = await fetch(`/lessons/lesson/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const extractedLessonID = data.id;

        if (video) {
          const formData = new FormData();
          formData.append('video', video);

          await fetch(`/video/upload/${extractedLessonID}`, {
            method: 'POST',
            body: formData
          });
        }

        // Reset form on success
        setName('');
        setExampleCode('');
        setLessonText('');
        setExpectedOutput('');
        setDisplayIndex(0);
        setVideo(null);
        setTopicID('');
        setSelectedCategory('');
        setTopics([]);
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select 
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              Topic
            </label>
            <select 
              id="topic" 
              value={topicID} 
              onChange={(e) => setTopicID(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              required
              disabled={!selectedCategory}
            >
              <option value="">Select a topic</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Lesson Name
          </label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter lesson name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="display-index" className="block text-sm font-medium text-gray-700">
              Display Index
            </label>
            <input 
              type="number" 
              id="display-index" 
              value={displayIndex} 
              onChange={(e) => setDisplayIndex(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="video" className="block text-sm font-medium text-gray-700">
              Video (Optional)
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
          disabled={loading || !name.trim() || !topicID}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Lesson...
            </>
          ) : (
            'Create Lesson'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateLesson;
