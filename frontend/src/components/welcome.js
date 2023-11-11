import React from "react";
import './components.css'; // Import your CSS file for styling
import LoginButton from "./login-button";
import heroImage from "./1.jpg";
import videoImage from "./2.jpg"
import learningImage1 from "./3.jpg"
import progressImage from "./4.jpg"
import learningImage2 from "./5.jpg"

const Welcome = () => {
  const heroButtonStyles = {
    backgroundColor: '#FFCA1B',
    cornerRadius: 0,
  }

  return (
    <div className="welcome-container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Get started with Python for free.</h1>
          <p>Build a foundation in Python with our interactive lessons.<LoginButton /></p>
        </div>
        <div className="hero-content">
          <img src={heroImage} alt="PyProdigy" className="hero-image" />
        </div>
      </div>
      <div className="cta">Your pace. Any device. Get started.</div>
      <div className="features">
        <div className="feature">
          <div className="feature-title">Fun Video Lessons 😄</div>
          <b className="feature-description">Engaging video lessons designed to make learning fun and effective.</b>
          <img src={videoImage} alt="Image Placeholder" />
        </div>
        <div className="feature">
          <img src={learningImage1} alt="Image Placeholder" />
          <div className="feature-title">In-browser IDE 🤓</div>
          <b className="feature-description">Work from any device as you write and run your code in the cloud.</b>
        </div>
        <div className="feature">
          <div className="feature-title">Track Your Progress 💪</div>
          <b className="feature-description">Monitor your progress and achievements to stay motivated.</b>
          <img src={progressImage} alt="Image Placeholder" />
        </div>
        <div className="feature">
          <img src={learningImage2} alt="Image Placeholder" />
          <div className="feature-title">100 Days of Code Challenge 🚀</div>
          <b className="feature-description">Join our coding challenge to code daily and level up.</b>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
