import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Import your stylesheets here
import App from './App';
import reportWebVitals from './reportWebVitals';


const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);

reportWebVitals(console.log);
