import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpLogin from "./components/sign-up-login";
import Topics from './components/topics';
import Header from './components/header';
import Grid from './components/lesson-grid';
import Profile from './components/profile-full';
import CMS from './components/cms';
import './App.css';


const App = () => {
  return (
    <div>
     
      <Router>
      <Header />
        <div className='app'>
          <div className="app-container">
            <Routes>
              <Route exact path="/" element={<SignUpLogin/>} />
              <Route exact path="/topics" element={<Topics/>} />
              <Route exact path="/profile" element={<Profile/>} />
              <Route path="/learn/" element={<Grid/>} />
              <Route path="/learn/:lessonID" element={<Grid/>} />
              <Route path="/cms/" element={<CMS/>} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
};

export default App;
