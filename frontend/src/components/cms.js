import React from 'react';
import './components.css';
import CreateLesson from './create-lesson';
import CreateCategory from './create-category';
import CreateTopic from './create-topic';

const CMS = () => {

  return (
    <div className="grid-container">
      <div className="">
        <CreateCategory />
      </div>
      <div className="">
        <CreateTopic />
      </div>
      <div className="">
        <CreateLesson />
      </div>
    </div>
  );
};

export default CMS;
