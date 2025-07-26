import React, { useEffect, useState } from 'react';
import VideoPlayer from './Video';
import IDE from './IDE';
import LabText from './LabText';
import Terminal from './Terminal';

const LabLayout = () => {
  const [labData, setLabData] = useState(null);
  const [labID, setLabID] = useState(null);

  useEffect(() => {
    console.log('LabLayout: useEffect triggered');
    
    const fetchLabConfig = async () => {
      try {
        console.log('LabLayout: Starting fetchLabConfig');
        const jwt = localStorage.getItem('jwt');
        console.log('LabLayout: JWT retrieved:', jwt ? 'Present' : 'Missing');
        
        const response = await fetch(`/labs/lab`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });

        console.log('LabLayout: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const labContent = await response.json();
        console.log('LabLayout: Lab content received:', labContent);
        console.log('LabLayout: Lab elements:', labContent.elements);
        
        setLabID(labContent._id);
        setLabData(labContent);
        
        console.log('LabLayout: State updated - labID:', labContent._id);
      } catch (error) {
        console.error('LabLayout: Failed to fetch lab configuration:', error);
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
  }, []);

  const renderComponent = (componentType) => {
    console.log('LabLayout: Rendering component type:', componentType);
    console.log('LabLayout: labData available:', !!labData);
    
    switch (componentType) {
      case 'IDE':
        console.log('LabLayout: Rendering IDE with labData:', labData);
        return <IDE labData={labData} />;
      case 'LabText':
        console.log('LabLayout: Rendering LabText with lab_text:', labData?.lab_text);
        return <LabText labText={labData.lab_text} />;
      case 'Terminal':
        console.log('LabLayout: Rendering Terminal with terminal_commands:', labData?.terminal_commands);
        return <Terminal terminalText={labData.terminal_commands} />;
      case 'Video':
        console.log('LabLayout: Rendering VideoPlayer with labID:', labID);
        return <VideoPlayer labID={labID} />;
      default:
        console.warn('LabLayout: Unknown component type:', componentType);
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

  console.log('LabLayout: Render check - labData:', !!labData, 'labID:', !!labID);
  
  if (!labData || !labID) {
    console.log('LabLayout: Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading lab configuration...</div>
      </div>
    );
  }

  const components = labData.elements || [];
  console.log('LabLayout: Components to render:', components);
  console.log('LabLayout: Components length:', components.length);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-6 min-h-[calc(100vh-3rem)] ${getGridClasses(components.length)}`}>
          {components.map((componentType, index) => {
            console.log(`LabLayout: Mapping component ${index}:`, componentType);
            return (
              <div 
                key={`${componentType}-${index}`}
                className={`${getComponentClasses(index, components.length)} bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden`}
              >
                <div className="h-full p-4">
                  {renderComponent(componentType)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LabLayout;
