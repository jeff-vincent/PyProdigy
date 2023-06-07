import React, { useState, useEffect } from 'react';

const CreateTopic = () => {
  const [thumbnail, setThumbnail] = useState(null);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetch('http://localhost:8085/category')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleThumbnailChange = (event) => {
    setThumbnail(event.target.files[0]);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create the payload object
    const payload = {
      name: name,
      category_id: selectedCategory,
    };

    console.log(payload);

    // Send the payload as JSON to the server
    fetch('http://localhost:8085/topic/', {
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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="thumbnail">Thumbnail Image:</label>
        <input type="file" id="thumbnail" onChange={handleThumbnailChange} />
      </div>
      <div>
        <label htmlFor="name">Topic Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} />
      </div>
      <div>
        <label htmlFor="category">Category:</label>
        <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default CreateTopic;
