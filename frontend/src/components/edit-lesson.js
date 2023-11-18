import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './components.css';

const EditLesson = () => {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [exampleCode, setExampleCode] = useState('');
  const [video, setVideo] = useState(null);
  const [displayIndex, setDisplayIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch(`/lessons/category`);
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          const defaultCategoryId = categoriesData[0].id;
          const topicsResponse = await fetch(`/lessons/${defaultCategoryId}/topics`);
          const topicsData = await topicsResponse.json();
          setTopics(topicsData);
        }
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
          setDisplayIndex(data.display_index)
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      // Reset fields if no lesson is selected
      setLessonText('');
      setLessonName('');
      setExpectedOutput('');
      setExampleCode('');
    }
  };

  const handleVideoChange = (event) => {
    setVideo(event.target.files[0]);
  };
  const handleDisplayIndexChange = (event) => {
    setDisplayIndex(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create the payload object
    const payload = {
      id: selectedLessonId,
      example_code: exampleCode,
      text: lessonText,
      name: lessonName,
      expected_output: expectedOutput,
      display_index: displayIndex,
    };

    // Send the payload as JSON to the server
    fetch(`/lessons/lesson/${selectedLessonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          // Handle successful form submission
          const formData = new FormData();
          formData.append('video', video);

          return fetch(`/video/upload/${selectedLessonId}`, {
            method: 'POST',
            body: formData,
          });
        } else {
          throw new Error('Failed to update lesson.');
        }
      })
      .then((response) => {
        if (response.ok) {
          // Handle successful video upload
          console.log('Video uploaded successfully.');
        } else {
          throw new Error('Failed to upload video.');
        }
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
      });
  };

  return (
      <div>
        <h2>Edit Lesson</h2>
    <div className="lesson-form">


      <div className="form-group">
        <label htmlFor="lessonDropdown" className="form-label">
          Select a Lesson:
        </label>
        <select
          id="lessonDropdown"
          onChange={handleLessonSelectChange}
          className="form-select"
          value={selectedLessonId}
        >
          <option value="">Select a lesson</option>
          {categories.map((category) =>
            category.topics.map((topic) =>
              topic.lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))
            )
          )}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="lessonName" className="form-label">
          Lesson Name:
        </label>
        <input
          type="text"
          id="lessonName"
          value={lessonName}
          onChange={(event) => setLessonName(event.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lessonText" className="form-label">
          Lesson Text:
        </label>
        <ReactQuill
          id="lessonText"
          value={lessonText}
          onChange={(content) => setLessonText(content)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="exampleCode" className="form-label">
          Example Code:
        </label>
        <textarea
          id="exampleCode"
          value={exampleCode}
          onChange={(event) => setExampleCode(event.target.value)}
          className="form-input"
          rows="4"
        />
      </div>
      <div className="form-group">
        <label htmlFor="display-index" className="form-label">Display Index:</label>
        <input type="text" id="display-index" value={displayIndex} onChange={handleDisplayIndexChange} className="form-input" />
      </div>

      <div className="form-group">
        <label htmlFor="expectedOutput" className="form-label">
          Expected Output:
        </label>
        <textarea
          id="expectedOutput"
          value={expectedOutput}
          onChange={(event) => setExpectedOutput(event.target.value)}
          className="form-input"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label htmlFor="video" className="form-label">
          Update Video:
        </label>
        <input
          type="file"
          id="video"
          onChange={handleVideoChange}
          className="form-input"
        />
      </div>

      <button type="submit" onClick={handleSubmit} className="submit-button">
        Save Changes
      </button>
    </div>
      </div>

  );
};

export default EditLesson;
