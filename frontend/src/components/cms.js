import React from 'react';
import CreateLesson from './create-lesson';
import CreateCategory from './create-category';
import CreateTopic from './create-topic';
import EditLesson from './edit-lesson';

const CMS = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl">
            <h2 className="text-3xl font-bold text-white">Lab CMS</h2>
            <p className="text-blue-100 mt-2">Manage your educational content</p>
          </div>

          {/* Content Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Category Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-blue-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Create Category
                  </h3>
                </div>
                <div className="p-6">
                  <CreateCategory />
                </div>
              </div>

              {/* Create Topic Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-blue-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Create Topic
                  </h3>
                </div>
                <div className="p-6">
                  <CreateTopic />
                </div>
              </div>

              {/* Create Lesson Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-blue-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Create Lesson
                  </h3>
                </div>
                <div className="p-6">
                  <CreateLesson />
                </div>
              </div>

              {/* Edit Lesson Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-blue-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Edit Lesson
                  </h3>
                </div>
                <div className="p-6">
                  <EditLesson />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMS;
