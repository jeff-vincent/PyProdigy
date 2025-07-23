import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import Homepage from './components/Homepage';
import OrgPortalLayout from './components/OrgPortalLayout';
import LabLayout from './components/LabLayout';
import NotFound from './components/NotFound';
import './App.css';
import { jwtDecode } from 'jwt-decode';

const RoutesWithRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get('token');
    if (tokenFromUrl) {
      try {
        const decoded = jwtDecode(tokenFromUrl);
        console.log('Decoded JWT', decoded);
        const labId = decoded.lab_id;
        localStorage.setItem('jwt', tokenFromUrl);
        url.searchParams.delete('token');
        navigate(`/lab/${labId}`);
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />

      {/* Org Portal for admins, internal users */}
      <Route path="/org/:orgId/*" element={<OrgPortalLayout />}/>

      {/* Lab UI for end-users */}
      <Route path="/lab/:labId/*" element={<LabLayout />}/>

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
