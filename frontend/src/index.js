import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import './index.css'; // Import your stylesheets here
import App from './App';
import reportWebVitals from './reportWebVitals';

const OnRedirectCallback = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [userID, setUserID] = useState(null);
  const [loading, setLoading] = useState(false); // State to manage loading spinner visibility

  const fetchComputeStatus = async (userId) => {
    try {
      const computeResponse = await fetch(`/compute/start/${userId}`);
      if (computeResponse.ok) {
        const computeResult = await computeResponse.json();
        console.log('Compute Result:', computeResult);
        if (computeResult === 'Pod status: Terminating') {
          setLoading(true);
          setTimeout(() => {
            fetchComputeStatus(userId);
          }, 4000);
        } else if (computeResult === `Container ${userId} created.` || computeResult === 'Pod status: Running') {
          setUserID(userId);
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
        console.log('Access Token:', accessToken);

        const response = await fetch(`/api/user/${accessToken}`);

        if (response.ok) {
          const userData = await response.json();
          console.log('User Data:', userData);

          // Fetch compute status recursively until condition met
          await fetchComputeStatus(userData.id);
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
  {!loading && <App userID={userID} />} {/* Render App component when loading is false */}
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
