import React, { useState } from 'react';

const CreateTopic = () => {
  const [thumbnail, setThumbnail] = useState(null);
  const [name, setName] = useState('');

  const BASE_URL = process.env.BASE_URL
  const handleThumbnailChange = (event) => {
    setThumbnail(event.target.files[0]);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Create the payload object
    const payload = {
      name: name,
    };
  
    // Send the payload as JSON to create the category
    const createResponse = await fetch(`/lessons/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    // Check if the category was created successfully
    if (createResponse.ok) {
      const category = await createResponse.json();
  
      // Check if a thumbnail file was selected
      if (thumbnail) {
        // Create a new FormData object
        const formData = new FormData();
        formData.append('thumbnail', thumbnail);
        formData.append('id', category.id);
  
        // Send the thumbnail as a PUT request to update the category
        const updateResponse = await fetch(`/lessons/category/${category.id}`, {
          method: 'PUT',
          body: formData,
        });
  
        if (!updateResponse.ok) {
          console.error('Error updating category:', updateResponse.status);
        }
      }
  
      // Handle other success scenarios or redirects after updating the category
    } else {
      console.error('Error creating category:', createResponse.status);
    }
  };
  

  return (
    <div>
      <h2>Create a category</h2>
    <form onSubmit={handleSubmit} className="lesson-form">
      <div className="form-group">
        <label htmlFor="thumbnail" className="form-label">Thumbnail Image:</label>
        <input type="file" id="thumbnail" onChange={handleThumbnailChange} className="form-input" />
      </div>
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
