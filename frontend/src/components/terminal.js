import React, { useState, useEffect } from 'react';

const Terminal = ({ terminalText }) => {
  console.log('Terminal: Component initialized with terminalText:', terminalText);
  
  const [inputValue, setInputValue] = useState('');
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Terminal: useEffect triggered with terminalText:', terminalText);
    
    if (terminalText) {
      console.log('Terminal: Setting initial output with terminalText');
      // Display initial terminal commands/instructions if provided
      setOutput([{ type: 'info', content: terminalText }]);
    } else {
      console.log('Terminal: No terminalText provided');
    }
  }, [terminalText]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!inputValue.trim()) return;

    setLoading(true);

    // Add the command to output history
    setOutput(prev => [...prev, { type: 'command', content: `$ ${inputValue}` }]);

    try {
      const formData = new FormData();
      formData.append('script', inputValue);
      const accessToken = localStorage.getItem('jwt');
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await fetch(`/compute/run`, {
        method: 'POST',
        body: formData,
        headers: headers,
      });

      if (response.ok) {
        const rawContent = await response.text();
        const podTerminated = "Error from server (NotFound):";
        
        let outputContent;
        if (rawContent.includes(podTerminated)) {
          outputContent = 'Your cloud environment needs to be restarted.\nCopy any code you\'d like to save and refresh your browser to continue.';
        } else {
          outputContent = rawContent || 'Command executed successfully';
        }

        setOutput(prev => [...prev, { type: 'output', content: outputContent }]);
      } else {
        throw new Error(`HTTP ${response.status}: Failed to execute command`);
      }
    } catch (error) {
      console.error('Error running command:', error);
      setOutput(prev => [...prev, { type: 'error', content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }

    setInputValue('');
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  console.log('Terminal: Rendering component');
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h3 className="text-white font-semibold ml-4">Python Terminal</h3>
        </div>
        <button 
          onClick={clearTerminal}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
        >
          Clear
        </button>
      </div>

      {/* Terminal Body */}
      <div className="bg-gray-900 min-h-[400px] max-h-[600px] overflow-y-auto">
        <div className="p-4 font-mono text-sm">
          {/* Output History */}
          <div className="space-y-1 mb-4">
            {output.map((line, index) => (
              <div key={index} className={`whitespace-pre-wrap ${
                line.type === 'command' ? 'text-green-400' :
                line.type === 'error' ? 'text-red-400' : 
                line.type === 'info' ? 'text-blue-400' : 'text-gray-300'
              }`}>
                {line.content}
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <span className="text-green-400 font-bold">$</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              disabled={loading}
              className="flex-1 bg-transparent text-gray-300 outline-none placeholder-gray-500 disabled:opacity-50"
              placeholder="Enter Python code or commands..."
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-4 py-1 rounded transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Running...
                </>
              ) : (
                'Execute'
              )}
            </button>
          </form>

          {/* Loading indicator */}
          {loading && (
            <div className="mt-2 text-yellow-400">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-2"></div>
                Executing command...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
