import React, { useState, useEffect, useRef } from 'react';

const Terminal = ({ terminalText }) => {
  console.log('Terminal: Component initialized with terminalText:', terminalText);
  
  const [inputValue, setInputValue] = useState('');
  const [output, setOutput] = useState([]);
  const [connected, setConnected] = useState(false);
  const [currentLine, setCurrentLine] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const wsRef = useRef(null);
  const terminalRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    console.log('Terminal: useEffect triggered with terminalText:', terminalText);
    
    if (terminalText) {
      console.log('Terminal: Setting initial output with terminalText');
      setOutput([{ type: 'info', content: terminalText }]);
    }
    
    // Initialize WebSocket connection
    initWebSocket();
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [terminalText]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const initWebSocket = async (retryAttempt = 0) => {
    const accessToken = localStorage.getItem('jwt');
    if (!accessToken) {
      setOutput(prev => [...prev, { type: 'error', content: 'Authentication required' }]);
      return;
    }

    // Extract user info from token (you may need to adjust this based on your token structure)
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const userId = tokenPayload.user_id;
    const namespace = tokenPayload.org_id;

    // Add initial sleep period for dev environment spin-up on first attempt
    if (retryAttempt === 0) {
      setOutput(prev => [...prev, { type: 'info', content: 'Initializing development environment...' }]);
      await sleep(3000); // 3 second initial wait for environment setup
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/compute/terminal/${userId}`;
    
    // Create WebSocket with auth headers (note: not all browsers support headers in WebSocket constructor)
    try {
      wsRef.current = new WebSocket(wsUrl, [], {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': userId,
          'X-Namespace': namespace
        }
      });
    } catch (error) {
      // Fallback for browsers that don't support headers in WebSocket constructor
      wsRef.current = new WebSocket(wsUrl);
    }
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      setIsRetrying(false);
      setRetryCount(0);
      
      // Send auth info with JWT token
      wsRef.current.send(JSON.stringify({
        namespace: namespace,
        user_id: userId,
        auth_token: accessToken
      }));
    };
    
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'output') {
        setCurrentLine(prev => prev + message.content);
        
        // If the content contains newlines, split and add to output
        if (message.content.includes('\n')) {
          const lines = (currentLine + message.content).split('\n');
          const completeLines = lines.slice(0, -1);
          const remainingLine = lines[lines.length - 1];
          
          completeLines.forEach(line => {
            if (line.trim()) {
              setOutput(prev => [...prev, { type: 'output', content: line }]);
            }
          });
          
          setCurrentLine(remainingLine);
        }
      } else if (message.type === 'error') {
        const errorContent = message.content;
        setOutput(prev => [...prev, { type: 'error', content: errorContent }]);
        
        // Check if it's a pod not found error and retry
        if (errorContent.toLowerCase().includes('pod not found') || 
            errorContent.toLowerCase().includes('environment not ready')) {
          handleRetryableError(retryAttempt);
        }
      }
    };
    
    wsRef.current.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      setConnected(false);
      
      // Handle specific close codes that indicate retryable errors
      if (event.code === 1011 || event.code === 1006 || event.reason?.includes('pod not found')) {
        handleRetryableError(retryAttempt);
      } else {
        setOutput(prev => [...prev, { type: 'error', content: 'Connection lost. Refresh to reconnect.' }]);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
      
      // Always try to retry on connection errors (could be environment spinning up)
      handleRetryableError(retryAttempt);
    };
  };

  const handleRetryableError = async (currentRetryAttempt) => {
    const maxRetries = 5;
    const newRetryCount = currentRetryAttempt + 1;
    
    if (newRetryCount <= maxRetries) {
      setIsRetrying(true);
      setRetryCount(newRetryCount);
      
      // Exponential backoff with jitter: 2^attempt * 1000ms + random(0-1000)ms
      const baseDelay = Math.pow(2, newRetryCount) * 1000;
      const jitter = Math.random() * 1000;
      const retryDelay = baseDelay + jitter;
      
      setOutput(prev => [...prev, { 
        type: 'info', 
        content: `Environment not ready. Retrying in ${Math.round(retryDelay/1000)}s... (${newRetryCount}/${maxRetries})` 
      }]);
      
      retryTimeoutRef.current = setTimeout(() => {
        initWebSocket(newRetryCount);
      }, retryDelay);
    } else {
      setIsRetrying(false);
      setOutput(prev => [...prev, { 
        type: 'error', 
        content: 'Failed to connect after multiple attempts. The development environment may not be available.' 
      }]);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!inputValue.trim() || !connected) return;

    // Add the command to output history
    setOutput(prev => [...prev, { type: 'command', content: `$ ${inputValue}` }]);

    // Send command via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        content: inputValue
      }));
    }

    setInputValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  const clearTerminal = () => {
    setOutput([]);
    setCurrentLine('');
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, currentLine]);

  console.log('Terminal: Rendering component');
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : isRetrying ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <h3 className="text-white font-semibold ml-4">
            Interactive Terminal {
              connected ? '(Connected)' : 
              isRetrying ? `(Retrying ${retryCount}/5...)` : 
              '(Disconnected)'
            }
          </h3>
        </div>
        <button 
          onClick={clearTerminal}
          className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
        >
          Clear
        </button>
      </div>

      {/* Terminal Body */}
      <div ref={terminalRef} className="bg-gray-900 min-h-[400px] max-h-[600px] overflow-y-auto">
        <div className="p-4 font-mono text-sm">
          {/* Output History */}
          <div className="space-y-1 mb-2">
            {output.map((line, index) => (
              <div key={index} className={`whitespace-pre-wrap ${
                line.type === 'command' ? 'text-green-400' :
                line.type === 'error' ? 'text-red-400' : 
                line.type === 'info' ? 'text-blue-400' : 'text-gray-300'
              }`}>
                {line.content}
              </div>
            ))}
            {/* Current line being built */}
            {currentLine && (
              <div className="text-gray-300 whitespace-pre-wrap">{currentLine}</div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <span className="text-green-400 font-bold">$</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!connected}
              className="flex-1 bg-transparent text-gray-300 outline-none placeholder-gray-500 disabled:opacity-50"
              placeholder={connected ? "Enter commands..." : "Connecting..."}
              autoFocus
            />
          </form>

          {/* Connection status */}
          {!connected && (
            <div className="mt-2 text-yellow-400">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-2"></div>
                {isRetrying ? 
                  `Retrying connection (${retryCount}/5)... Environment may be starting up.` :
                  'Connecting to terminal...'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
