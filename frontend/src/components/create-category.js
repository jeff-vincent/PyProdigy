import React, { useState } from 'react';

const CreateTopic = () => {
  const [thumbnail, setThumbnail] = useState(null);
  const [name, setName] = useState('');

  const handleThumbnailChange = (event) => {
    setThumbnail(event.target.files[0]);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Create the payload object
    const payload = {
      name: name,
    };

    // Send the payload as JSON to the server
    fetch('http://localhost:8085/category/', {
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
        <label htmlFor="name">Category Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default CreateTopic;
