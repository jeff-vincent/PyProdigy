import React from "react";
import './components.css';
import LoginButton from "./login-button";

const Welcome = () => {
  const buttonStyle = {
    fontSize: '1.2rem',
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    color: '#4CAF50',
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <div>
      <div className="hero">
        <div className="hero-content">
          <h2>👋 Welcome to PyProdigy 👋</h2>
          <p>Learn some cool Python stuff with our free curriculum!</p>
          <LoginButton/>
        </div>
      </div>
      <div id="cta" className="cta">
        <h2>💻 Ready to Code? 💻</h2>
        <p>💪 Just login to get started!!! 💪</p>
        <LoginButton/>
      </div>

      <div className="features">
        <div className="feature">
          <h3>🎥 Fun Video Lessons 😄</h3>
          <p>Nifty video lessons explain the core concepts!!!</p>
      </div>
      <div className="feature">
        <h3>💻 In-browser IDE 🤓</h3>
        <p>Everything you need is right in the browser for you!!!</p>
      </div>
      <div className="feature">
        <h3>📈 Track your progress 💪</h3>
        <p>See a record of the lessons you've completed in your profile!!!</p>
      </div>
    </div>
    </div>
  );
};

export default Welcome;
