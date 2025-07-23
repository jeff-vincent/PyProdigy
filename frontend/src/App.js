import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import Homepage from './components/Homepage';
import OrgPortalLayout from './components/OrgPortalLayout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import LabLayout from './components/LabLayout';
import LessonView from './components/LessonView';
import Progress from './components/Progress';
import NotFound from './components/NotFound';
import './App.css';
import AuthProvider from './components/AuthProvider';
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
      <Route path="/org/:orgId/*" element={<OrgPortalLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Lab UI for end-users */}
      <Route path="/lab/:labId/*" element={<LabLayout />}>
        <Route path="" element={<LessonView />} />
        <Route path="progress" element={<Progress />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <div>
      <AuthProvider>
        <Router>
          <RoutesWithRedirect />
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;
