import React from 'react';
import './components.css';
import CreateLesson from './create-lesson';

const CMS = () => {

  return (
    <div className="grid-container">
      {/* <div className="">
        <CreateCategory />
      </div>
      <div className="">
        <CreateTopic />
      </div> */}
      <div className="">
        <CreateLesson />
      </div>
    </div>
  );
};

export default CMS;
