import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { redirect } from 'react-router-dom';

const withAdminRole = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated, isLoading, user } = useAuth0();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const checkAdminRole = async () => {
        if (!isAuthenticated || isLoading) {
          return;
        }

        try {
          const roles = user['https://127.0.0.1/roles']; // Replace with your actual roles key
          console.log('roles:', roles)
          const isAdminUser = roles && roles.includes('admin');
          setIsAdmin(isAdminUser);
        } catch (error) {
          console.error(error);
          // Handle error, you can redirect to an error page if necessary
        }
      };

      checkAdminRole();
    }, [isAuthenticated, isLoading, user]);

    if (isLoading) {
      // Show loading spinner or message while Auth0 is being initialized
      return <div>Loading...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
      // Redirect to the home page if the user is not authenticated or doesn't have admin role
      return redirect('https://127.0.0.1');
    }

    // Render the wrapped component if the user is authenticated and has admin role
    return <WrappedComponent {...props} />;
  };
};

export default withAdminRole;
