import React from "react";
import './components.css'; // Import your CSS file for styling
import LoginButton from "./login-button";

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">👋 Welcome to PyProdigy 👋</h1>
          <p className="hero-description">Learn Python with our fun, interactive lessons!</p>
          <LoginButton className="hero-button" />
        </div>
      </div>

      <div className="cta">
        <h2 className="cta-title">💻 Ready to Code? 💻</h2>
        <p className="cta-description">Start coding now with our user-friendly in-browser IDE!</p>
        <LoginButton className="cta-button" />
      </div>

      <div className="features">
        <div className="feature">
          <h3 className="feature-title">🎥 Fun Video Lessons 😄</h3>
          <p className="feature-description">Engaging video lessons designed to make learning fun and effective.</p>
        </div>
        <div className="feature">
          <h3 className="feature-title">💻 In-browser IDE 🤓</h3>
          <p className="feature-description">Work from any phone, tablet or computer as you write and run your code in the cloud.</p>
        </div>
        <div className="feature">
          <h3 className="feature-title">📈 Track Your Progress 💪</h3>
          <p className="feature-description">Monitor your progress and achievements to stay motivated and focused.</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
