import React, { useState, useEffect } from 'react';

const CreateTopic = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayIndex, setDisplayIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/lessons/category`)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleDisplayIndexChange = (event) => {
    setDisplayIndex(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      name: name,
      category_id: selectedCategory,
      display_index: displayIndex,
    };

    try {
      const response = await fetch(`/lessons/topic/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Reset form on success
        setName('');
        setSelectedCategory('');
        setDisplayIndex(0);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select 
            id="category" 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Topic Name
          </label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={handleNameChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter topic name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="display-index" className="block text-sm font-medium text-gray-700">
            Display Index
          </label>
          <input 
            type="number" 
            id="display-index" 
            value={displayIndex} 
            onChange={handleDisplayIndexChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="0"
            min="0"
          />
        </div>

        <button 
          type="submit"
          disabled={loading || !name.trim() || !selectedCategory}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            'Create Topic'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateTopic;
