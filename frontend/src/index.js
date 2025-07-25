import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain="dev-w5iil6bapqnf2nai.us.auth0.com"
    clientId="j4dapddu0Azkecbwqv0buDB3ssPNb4ko"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "urn:labthingy:api",
    }}
  >
    <App />
  </Auth0Provider>,
);