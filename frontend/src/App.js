import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from "./components/welcome";
import Topics from './components/topics';
import Header from './components/header';
import Grid from './components/lesson-grid';
import Profile from './components/profile-full';
import CMS from './components/cms';
import './App.css';
import Footer from "./components/footer";

const App = ({ user }) => {
  return (
    <div>
      <Router>
        <Header user={user}/>
        <div className='app'>
          <div className="app-container">
            <Routes>
              <Route exact path="/" element={<Welcome />} />
              <Route exact path="/topics" element={<Topics />} />
              <Route exact path="/profile" element={<Profile />} />
              <Route path="/learn/" element={<Grid />} />
              <Route path="/learn/:lessonID" element={<Grid />} />
              <Route path="/cms/" element={<CMS />} />
            </Routes>
          </div>
        </div>
        <Footer/>
      </Router>
    </div>
  );
};

export default App;
