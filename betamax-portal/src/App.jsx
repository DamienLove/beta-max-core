import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import AppRegistrationPage from './pages/AppRegistrationPage';
import MissionDetailsPage from './pages/MissionDetailsPage';
import './App.css';

const ProtectedRoute = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">INITIALIZING_SYSTEM...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!profile) return <Navigate to="/onboarding" />;
  
  if (requireRole && profile.role !== requireRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  const { user, profile } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user && profile ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/onboarding" element={user ? (profile ? <Navigate to="/dashboard" /> : <OnboardingPage />) : <Navigate to="/auth" />} />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/mission/:id" element={
        <ProtectedRoute>
          <MissionDetailsPage />
        </ProtectedRoute>
      } />
      <Route path="/register-app" element={
        <ProtectedRoute requireRole="developer">
          <AppRegistrationPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="betamax-root">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}
