import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const OnRedirectCallback = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        console.log('Access Token:', accessToken);

        const response = await fetch(`/api/user/${accessToken}`);

        if (response.ok) {
          const userData = await response.json();
          console.log('User Data:', userData);

          // TODO: Implement spinning up user's pod logic here

          const computeResponse = await fetch(`/compute/start/${userData.id}`);

          if (computeResponse.ok) {
            const computeResult = await computeResponse.json();
            console.log('Compute Result:', computeResult);
            console.log('UserID in the callback:', userData.id);
            // Set the user ID in the state
            setUserID(userData.id);
          } else {
            console.error('Failed to start user compute');
          }
        } else {
          console.error('Failed to get or create user');
        }
      } catch (error) {
        console.error('Error:', error.message);
        // Handle the error, display a message to the user, or log it for debugging
      }
    };

    if (user) {
      fetchAccessToken();
    }
  }, [getAccessTokenSilently, user]);

  return <App userID={userID} />;
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
