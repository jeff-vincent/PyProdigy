import React from 'react';
import { Link } from 'react-router-dom';
import './components.css'; // Assuming you have a CSS file for header styling
import LoginButton from "./login-button";
import LogoutButton from "./logout-button";

const Header = ({ userID }) => {
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
          {userID ? (
            <li className="nav-list">
              <LogoutButton className="nav-link" />
            </li>
          ) : (
            <li className="nav-list">
              <LoginButton className="nav-link" />
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
