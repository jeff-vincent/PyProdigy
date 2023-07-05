import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const OnRedirectCallback = () => {
  const { getAccessTokenSilently, user } = useAuth0();

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();

        const formData = new FormData();
        formData.append('access_token', accessToken);

        const response = await fetch('/api/user', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log(result);
        } else {
          console.log('Failed to get or create user');
        }
      } catch (e) {
        console.log(e.message);
      }
    };

    if (user) {
      fetchAccessToken();
    }
  }, [getAccessTokenSilently, user]);

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
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
