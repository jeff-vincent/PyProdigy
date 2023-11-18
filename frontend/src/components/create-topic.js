import React, { useState, useEffect } from 'react';

const CreateTopic = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayIndex, setDisplayIndex] = useState(0)

  const BASE_URL = process.env.BASE_URL

  useEffect(() => {
    fetch(`/lessons/category`)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  const handleDisplayIndexChange = (event) => {
    setDisplayIndex(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create the payload object
    const payload = {
      name: name,
      category_id: selectedCategory,
      display_index: displayIndex,
    };

    console.log(payload);

    // Send the payload as JSON to the server
    fetch(`/lessons/topic/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .catch(error => {
        console.error('Error submitting form:', error);
      });
  };

  return (
    <div>
      <h2>Create a topic</h2>
    <form onSubmit={handleSubmit} className="lesson-form">
            <div className="form-group">
        <label htmlFor="category" className="form-label">Category:</label>
        <select id="category" value={selectedCategory} onChange={handleCategoryChange} className="form-select">
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="name" className="form-label">Topic Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} className="form-input" />
      </div>
      <div className="form-group">
        <label htmlFor="display-index" className="form-label">Display Index:</label>
        <input type="text" id="display-index" value={displayIndex} onChange={handleDisplayIndexChange} className="form-input" />
      </div>
      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
    </div>
  );
};

export default CreateTopic;
