import React from 'react';
import { Link } from 'react-router-dom';
import './components.css'; // Assuming you have a CSS file for header styling

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-link">Profile</Link>
          </li>
          <li className="nav-item">
            <Link to="/topics" className="nav-link">Topics</Link>
          </li>
          <li className="nav-item">
            <Link to="/learn" className="nav-link">Learn</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
