import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';
import TicketView from './pages/TicketView';
import CreateEvent from './pages/CreateEvent';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CheckIn from './pages/CheckIn';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRole }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Core pages inside Layout */}
      <Route 
        path="/" 
        element={
          <Layout>
            <Home />
          </Layout>
        } 
      />
      
      <Route 
        path="/events/:id" 
        element={
          <Layout>
            <EventDetails />
          </Layout>
        } 
      />

      {/* Attendee Protected Routes */}
      <Route 
        path="/bookings" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="attendee">
              <Layout>
                <MyBookings />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/bookings/:id" 
        element={
          <ProtectedRoute>
            <Layout>
              <TicketView />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Organizer Protected Routes */}
      <Route 
        path="/create-event" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="organizer">
              <Layout>
                <CreateEvent />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="organizer">
              <Layout>
                <OrganizerDashboard />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/check-in" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="organizer">
              <Layout>
                <CheckIn />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
