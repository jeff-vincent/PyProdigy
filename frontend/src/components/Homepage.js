import React, { useEffect } from "react";
import './components.css';

const Homepage = () => {

    useEffect(() => {
    const isChrome = navigator.userAgent.indexOf("Chrome") !== -1;
    if (!isChrome) {
      alert("Your browser isn't supported by PyProdigy. Please switch to Chrome for the best experience.");
    }
  }, []);

  return (
    <div className="welcome-container">
          <h1 className="hero-title">Build BAMF Labs and Stuff.</h1>
        </div>
  );
};

export default Homepage;
