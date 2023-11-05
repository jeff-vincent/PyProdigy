import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated, isLoading, user } = useAuth0();

    if (isLoading) {
      // Show loading spinner or message while Auth0 is being initialized
      return <div>Loading...</div>;
    }

    if (!isLoading && !isAuthenticated || !isLoading && !user) {
      // Redirect to the login page if the user is not authenticated or user object is not available
      return window.location.href = '/';
    }

    // Render the wrapped component if the user is authenticated
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
