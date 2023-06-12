import React, { useState, useEffect } from 'react';

const CreateLesson = () => {
  const [video, setVideo] = useState(null);
  const [exampleCode, setExampleCode] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [topicID, setTopicID] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [expectedOutput, setExpectedOutput] = useState('');

  const BASE_URL = process.env.BASE_URL

  useEffect(() => {
    fetch(`/lessons/category`)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;

    if (categoryId) {
      fetch(`/lessons/${categoryId}/topics`)
        .then(response => response.json())
        .then(data => {
          console.log(data); // Add this line to check the data received
          setTopics(data);
        })
        .catch(error => console.error('Error fetching topics:', error));
    } else {
      setTopics([]);
    }

    setTopicID('');
  };

  const handleExpectedOutputChange = (event) => {
    setExpectedOutput(event.target.value);
  };

  const handleVideoChange = (event) => {
    setVideo(event.target.files[0]);
  };

  const handleExampleCodeChange = (event) => {
    setExampleCode(event.target.value);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleLessonTextChange = (event) => {
    setLessonText(event.target.value);
  };

  const handleTopicIDChange = (event) => {
    setTopicID(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create the payload object
    const payload = {
      example_code: exampleCode,
      text: lessonText,
      name,
      topic_id: topicID,
      expected_output: expectedOutput // Include expected output in the payload
    };

    console.log(payload);

    // Send the payload as JSON to the server
    fetch(`/lessons/lesson/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (response.ok) {
          // Handle successful form submission and extract lessonID from the response
          return response.json();
        } else {
          throw new Error('Failed to submit form.');
        }
      })
      .then(data => {
        const extractedLessonID = data.id;
        setTopicID(extractedLessonID);

        const formData = new FormData();
        formData.append('video', video);

        return fetch(`/video/upload/${extractedLessonID}`, {
          method: 'POST',
          body: formData
        });
      })
      .then(response => {
        if (response.ok) {
          // Handle successful video submission
        } else {
          throw new Error('Failed to submit video.');
        }
      })
      .catch(error => {
        console.error('Error submitting form:', error);
      });
  };

  return (
    <div>
    <h2>Create a lesson</h2>
    
    <form onSubmit={handleSubmit} className="your-form">
      <div className="form-group">
        <label htmlFor="category" className="form-label">Category:</label>
        <select id="category" onChange={handleCategoryChange} className="form-select">
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="topic" className="form-label">Topic:</label>
        <select id="topic" value={topicID} onChange={handleTopicIDChange} className="form-select">
          <option value="">Select a topic</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="video" className="form-label">Video:</label>
        <input type="file" id="video" onChange={handleVideoChange} className="form-input" />
      </div>
      <div className="form-group">
        <label htmlFor="name" className="form-label">Lesson Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} className="form-input" />
      </div>
      <div className="form-group">
        <label htmlFor="exampleCode" className="form-label">Example Code:</label>
        <input type="text" id="exampleCode" value={exampleCode} onChange={handleExampleCodeChange} className="form-input" />
      </div>
      <div className="form-group">
        <label htmlFor="lessonText" className="form-label">Lesson Text:</label>
        <input type="text" id="lessonText" value={lessonText} onChange={handleLessonTextChange} className="form-input" />
      </div>
      <div className="form-group">
        <label htmlFor="expectedOutput" className="form-label">Expected Output:</label>
        <input type="text" id="expectedOutput" value={expectedOutput} onChange={handleExpectedOutputChange} className="form-input" />
      </div>
      <button type="submit" className="submit-button">Submit</button>
    </form>
    </div>
  );  
};

export default CreateLesson;
