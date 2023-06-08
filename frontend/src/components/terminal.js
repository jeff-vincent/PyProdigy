import React, { useState } from 'react';

const Terminal = () => {
  const [inputValue, setInputValue] = useState('');
  const [output, setOutput] = useState('');

  const BASE_URL = process.env.BASE_URL

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        const formData = new FormData();
        formData.append('cmd', inputValue);
        formData.append('os', 'python:latest')
        
        const response = await fetch(`/docker/run`, {
          method: 'POST',
          body: formData,  // Pass the formData object directly as the body
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        });
      
        if (response.ok) {
          const data = await response.json();
          console.log('CMD output:', data);
          // Handle success or navigate to a different page
          setOutput(data);
        } else {
          console.error('Error running CMD:', response.status);
          // Handle error
        }
      } catch (error) {
        console.error('Error running CMD:', error);
        // Handle error
      }
      

    setInputValue('');
  };

  return (
    <div className="terminal-container">
      <div className="terminal-output">{output}</div>
      <form onSubmit={handleSubmit} className="terminal-form">
  <span className="terminal-prompt">$</span>
  <input
    type="text"
    value={inputValue}
    onChange={handleInputChange}
    className="terminal-input"
  />
  {/* Remove the submit button */}
</form>

    </div>
  );
};

export default Terminal;
