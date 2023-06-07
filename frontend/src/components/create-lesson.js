import React, { useState, useEffect } from 'react';

const CreateLesson = () => {
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [exampleCode, setExampleCode] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [topicID, setTopicID] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [expectedOutput, setExpectedOutput] = useState('');

  useEffect(() => {
    fetch('http://localhost:8085/category')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;

    if (categoryId) {
      fetch(`http://localhost:8085/${categoryId}/topics`)
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

  const handleThumbnailChange = (event) => {
    setThumbnail(event.target.files[0]);
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
      lesson_text: lessonText,
      name,
      topic_id: topicID,
      expected_output: expectedOutput // Include expected output in the payload
    };

    console.log(payload);

    // Send the payload as JSON to the server
    fetch('http://localhost:8085/lesson/', {
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

        return fetch(`http://localhost:8084/video/upload/${extractedLessonID}`, {
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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="thumbnail">Thumbnail Image:</label>
        <input type="file" id="thumbnail" onChange={handleThumbnailChange} />
      </div>
      <div>
        <label htmlFor="video">Video:</label>
        <input type="file" id="video" onChange={handleVideoChange} />
      </div>
      <div>
        <label htmlFor="name">Lesson Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} />
      </div>
      <div>
        <label htmlFor="exampleCode">Example Code:</label>
        <input type="text" id="exampleCode" value={exampleCode} onChange={handleExampleCodeChange} />
      </div>
      <div>
        <label htmlFor="lessonText">Lesson Text:</label>
        <input type="text" id="lessonText" value={lessonText} onChange={handleLessonTextChange} />
      </div>
      <div>
        <label htmlFor="expectedOutput">Expected Output:</label>
        <input type="text" id="expectedOutput" value={expectedOutput} onChange={handleExpectedOutputChange} />
      </div>
      <div>
        <label htmlFor="category">Category:</label>
        <select id="category" onChange={handleCategoryChange}>
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="topic">Topic:</label>
        <select id="topic" value={topicID} onChange={handleTopicIDChange}>
          <option value="">Select a topic</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default CreateLesson;
