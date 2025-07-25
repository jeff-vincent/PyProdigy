import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './Video';
import IDE from './IDE';
import LessonText from './LessonText';

const LabLayout = () => {
  const { labId: labID } = useParams();

  useEffect(() => {
    const startComputeEnv = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`/compute/start/${labID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Compute env started:', data);
      } catch (error) {
        console.error('Failed to start compute environment:', error);
      }
    };

    startComputeEnv();
  }, [labID]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 grid-rows-2 gap-6 h-screen">
          {/* Left Column - Video (Top Left) */}
          <div className="col-span-1 row-span-1">
            <VideoPlayer lessonID={labID} />
          </div>
          
          {/* Left Column - IDE (Bottom Left) */}
          <div className="col-span-1 row-span-1">
            <IDE lessonID={labID} />
          </div>
          
          {/* Right Column - Lesson Text (Spans both right squares) */}
          <div className="col-span-1 row-span-2 sticky top-6 self-start">
            <LessonText lessonID={labID} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabLayout;
