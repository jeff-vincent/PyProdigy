import React, { useState } from 'react';

const CreateTopic = () => {
  const [name, setName] = useState('');

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const payload = {
      name: name,
    };
  
    const createResponse = await fetch(`/lessons/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    if (createResponse.ok) {
      const category = await createResponse.json();
      return window.location.href = '/cms'
    } else {
      console.error('Error creating category:', createResponse.status);
    }
  };
  

  return (
    <div>
      <h2>Create a category</h2>
    <form onSubmit={handleSubmit} className="lesson-form">
      <div className="form-group">
        <label htmlFor="name" className="form-label">Category Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} className="form-input" />
      </div>
      <button type="submit" className="submit-button">Submit</button>
    </form>
    </div>
  );
};

export default CreateTopic;
