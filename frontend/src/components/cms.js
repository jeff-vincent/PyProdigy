import React from 'react';
import './components.css';
import CreateLesson from './create-lesson';
import CreateCategory from './create-category';
import CreateTopic from './create-topic';

const CMS = () => {

  return (
    <div className="cms-container">
      <div className="grid-item">
        <CreateCategory />
      </div>
      <div className="grid-item">
        <CreateTopic />
      </div>
      <div className="grid-item">
        <CreateLesson />
      </div>
    </div>
  );
};  
export default CMS;
