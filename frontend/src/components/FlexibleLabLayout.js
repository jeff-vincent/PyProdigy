import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './Video';
import IDE from './IDE';
import LessonText from './LessonText';
import Terminal from './Terminal';

const LabLayout = () => {
  const [labConfig, setLabConfig] = useState(null);
  const [labID, setLabID] = useState(null);

  useEffect(() => {
    // Extract lab_id from JWT
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        setLabID(payload.lab_id);
      } catch (error) {
        console.error('Failed to parse JWT:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!labID) return;

    const fetchLabConfig = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`/labs/lab`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const labContent = await response.json();
        setLabConfig(labContent);
      } catch (error) {
        console.error('Failed to fetch lab configuration:', error);
      }
    };

    const startComputeEnv = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`/compute/start`, {
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

    fetchLabConfig();
    startComputeEnv();
  }, [labID]);

  const renderComponent = (componentType) => {
    switch (componentType) {
      case 'IDE':
        return <IDE lessonID={labID} />;
      case 'LabContent':
        return <LessonText lessonID={labID} />;
      case 'Terminal':
        return <Terminal lessonID={labID} />;
      case 'Video':
        return <VideoPlayer lessonID={labID} />;
      default:
        return null;
    }
  };

  const getGridClasses = (componentCount) => {
    switch (componentCount) {
      case 2:
        return 'grid-cols-2 grid-rows-1';
      case 3:
        return 'grid-cols-2 grid-rows-2';
      case 4:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-1 grid-rows-1';
    }
  };

  const getComponentClasses = (index, total) => {
    if (total === 3) {
      // For 3 components: first spans 2 columns, others are single column
      return index === 0 ? 'col-span-2' : 'col-span-1';
    }
    return 'col-span-1 row-span-1';
  };

  if (!labConfig || !labID) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading lab configuration...</div>
      </div>
    );
  }

  const components = labConfig.elements || [];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-6 h-screen ${getGridClasses(components.length)}`}>
          {components.map((componentType, index) => (
            <div 
              key={`${componentType}-${index}`}
              className={getComponentClasses(index, components.length)}
            >
              {renderComponent(componentType)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabLayout;
