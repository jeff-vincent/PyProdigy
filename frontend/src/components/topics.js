import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Topics = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/lessons/category`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading topics...</span>
        </div>
      </div>
    );
  }

  // Organize lessons by category and topic
  const organizedCategories = {};
  categories.forEach(category => {
    category.topics.forEach(topic => {
      if (!organizedCategories[category.name]) {
        organizedCategories[category.name] = {};
      }
      if (!organizedCategories[category.name][topic.name]) {
        organizedCategories[category.name][topic.name] = [];
      }
      organizedCategories[category.name][topic.name] = organizedCategories[category.name][topic.name].concat(topic.lessons);
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Learning Topics</h1>
          <p className="text-gray-600 text-lg">Choose a lesson to start your coding journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(organizedCategories).map(([categoryName, topics]) => (
            <div key={categoryName} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-2xl font-bold text-white">{categoryName}</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {Object.entries(topics).map(([topicName, lessons]) => (
                  <div key={topicName} className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-800 flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      {topicName}
                    </h4>
                    
                    <div className="space-y-2">
                      {lessons.map((lesson) => (
                        <a 
                          key={lesson.id} 
                          href={`/learn/${lesson.id}`} 
                          className="block p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-800 group-hover:text-blue-700 font-medium">
                              {lesson.name}
                            </span>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
