import React from "react";
import './components.css'; // Import your CSS file for styling
import LoginButton from "./login-button";
import { useAuth0 } from '@auth0/auth0-react';
import heroImage from "./1.jpg";
import videoImage from "./2.jpg"
import learningImage1 from "./3.jpg"
import progressImage from "./4.jpg"
import learningImage2 from "./5.jpg"

const Welcome = () => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <div className="welcome-container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Get started with Python for free.</h1>
          {isAuthenticated ? (
            <p>Build a foundation in Python with our interactive lessons.</p>
          ) : (
            <p>Build a foundation in Python with our interactive lessons. <LoginButton /></p>
          )}
        </div>
        <div className="hero-content">
          <img src={heroImage} alt="PyProdigy" className="hero-image" />
        </div>
      </div>
      <div className="cta">
        <div>Python fundamentals | SQL Databases | Testing in Python</div>
        <div>Data Science foundations | Object oriented programming</div>
      </div>
      <div className="features">
        <div className="feature">
          <div className="feature-title">Fun Video Lessons 😄</div>
          <b className="feature-description">Engaging video lessons designed to make learning fun and effective.</b>
          <img className="feature-img-left" src={videoImage} alt="Image Placeholder" />
        </div>
        <div className="feature">
          <img className="feature-img-right" src={learningImage1} alt="Image Placeholder" />
          <div className="feature-title">In-browser IDE 🤓</div>
          <b className="feature-description">Work from any device as you write and run your code in the cloud.</b>
        </div>
        <div className="feature">
          <div className="feature-title">Track Your Progress 💪</div>
          <b className="feature-description">Monitor your progress and achievements to stay motivated.</b>
          <img className="feature-img-left" src={progressImage} alt="Image Placeholder" />
        </div>
        <div className="feature">
          <img className="feature-img-right" src={learningImage2} alt="Image Placeholder" />
          <div className="feature-title">100 Days of Code Challenge 🚀</div>
          <b className="feature-description">Join our coding challenge to code daily and level up.</b>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
