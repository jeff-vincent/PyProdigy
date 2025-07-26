import React, { useState, useEffect } from 'react';

const VideoPlayer = ({ labID }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await fetch(`/video/stream/${labID}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load video');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (labID) {
      fetchVideo();
    }

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [labID]);
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
          Video Lesson
        </h3>
      </div>
      
      <div className="p-4">
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-300">Loading video...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-300">Error: {error}</p>
              </div>
            </div>
          ) : (
            <video 
              className="w-full h-full object-cover" 
              controls
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23374151'/%3E%3Cpath d='M40 30l20 15-20 15z' fill='%23ffffff'/%3E%3C/svg%3E"
            >
              <source src={videoUrl} type="video/mp4" />
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-300">Your browser does not support the video tag.</p>
                </div>
              </div>
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
