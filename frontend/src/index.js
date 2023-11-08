import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import './index.css'; // Import your stylesheets here
import App from './App';
import reportWebVitals from './reportWebVitals';

const OnRedirectCallback = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [loading, setLoading] = useState(false); // State to manage loading spinner visibility

  const fetchComputeStatus = async (accessToken) => {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const computeResponse = await fetch(`/compute/start`, {
        method: 'GET',
        headers: headers,
      });      if (computeResponse.ok) {
        const computeResult = await computeResponse.json();
        console.log('Compute Result:', computeResult);
        if (computeResult === 'Pod status: Terminating') {
          setLoading(true);
          setTimeout(() => {
            fetchComputeStatus();
          }, 4000);
        } else if (computeResult === `Container created.` || computeResult === 'Pod status: Running') {
          setLoading(false); // Hide loading spinner when condition is met
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        const headers = {
          Authorization: `Bearer ${accessToken}`
        }
        const response = await fetch(`/api/user/${accessToken}`, {
          method: 'GET',
          headers: headers,
        });

        if (response.ok) {
          await fetchComputeStatus(accessToken);
        } else {
          console.error('Failed to get or create user');
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    if (user) {
      fetchAccessToken();
    }
  }, [getAccessTokenSilently, user]);

  return (
<div >
  {loading && (
    <div className="loading-container">
      <h1>Spinning up your cloud environment</h1>
      <div className="loading-spinner" />
    </div>
  )}
  {!loading && <App user={user}/>} {/* Render App component when loading is false */}
</div>

  );
};

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-w5iil6bapqnf2nai.us.auth0.com"
      clientId="xtKBTiNb5uOEtqNgq6R12w7tzOaO4AwB"
      redirectUri={window.location.origin}
    >
      <OnRedirectCallback />
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals(console.log);
