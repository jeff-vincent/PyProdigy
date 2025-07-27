import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import Homepage from './components/Homepage';
import OrgPortalLayout from './components/OrgPortalLayout';
import FlexibleLabLayout from './components/FlexibleLabLayout';
import SignUp from './components/SignUp';
import NotFound from './components/NotFound';
import { useAuth0 } from '@auth0/auth0-react';
import { jwtDecode } from 'jwt-decode';

const RoutesWithRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get('token');

    const redirectToLab = (token) => {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded URL JWT:', decoded);

        const labId = decoded.lab_id;
        if (labId) {
          localStorage.setItem('jwt', token);
          url.searchParams.delete('token');
          window.history.replaceState({}, document.title, url.pathname);
          setTimeout(() => navigate(`/lab/${labId}`), 0);
        }
      } catch (err) {
        console.error('Invalid token in URL:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    const redirectToOrg = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: 'urn:labthingy:api',
        });
        const decoded = jwtDecode(token);
        console.log('Decoded Auth0 JWT:', decoded);
        console.log('Full token claims:', Object.keys(decoded));

        const orgId = decoded['org_id'];
        console.log('Extracted orgId:', orgId);
        
        if (orgId) {
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate(`/org/${orgId}`);
          }
        } else {
          console.warn('No organization_id found in token claims');
        }
      } catch (err) {
        console.error('Error getting Auth0 token:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    if (tokenFromUrl) {
      redirectToLab(tokenFromUrl);
    } else if (!isLoading && isAuthenticated) {
      redirectToOrg();
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently, navigate]);

  if (checkingAuth || isLoading) {
    return <div className="text-center p-4">Checking authentication...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/org/:orgId/*" element={<OrgPortalLayout />} />
      <Route path="/lab/:labId/*" element={<FlexibleLabLayout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <div>
        <Router>
          <RoutesWithRedirect />
        </Router>
    </div>
  );
};

export default App;
