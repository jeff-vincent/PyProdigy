import React, { useState } from 'react';

const CreatePet = () => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [image, setImage] = useState(null);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSpeciesChange = (event) => {
    setSpecies(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('species', species);
      formData.append('image', image);

      const response = await fetch('http://localhost:8000/pets/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Created pet:', data);
        // Handle success or navigate to a different page
      } else {
        console.error('Error creating pet:', response.status);
        // Handle error
      }
    } catch (error) {
      console.error('Error creating pet:', error);
      // Handle error
    }
  };

  return (
    <div>
      <h2>Create a Pet</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={handleNameChange} />
        </div>
        <div>
          <label>Species:</label>
          <input type="text" value={species} onChange={handleSpeciesChange} />
        </div>
        <div>
          <label>Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreatePet;
