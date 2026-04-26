import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import FeedbackScreen from './pages/FeedbackScreen';
import ResumeManager from './pages/ResumeManager';
import SessionsList from './pages/SessionsList';
import LandingPage from './pages/LandingPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-base font-sans text-center px-6">
      <div className="w-12 h-12 border-4 border-bg-muted border-t-accent rounded-full animate-spin mb-6"></div>
      <p className="text-accent font-serif text-[18px] font-bold mb-1 italic">FastTrackHire</p>
      <p className="text-text-tertiary font-sans font-bold tracking-[0.2em] uppercase text-[10px]">Initializing Neural Intelligence...</p>
    </div>
  );
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/sessions" element={<PrivateRoute><SessionsList /></PrivateRoute>} />
          <Route path="/resume" element={<PrivateRoute><ResumeManager /></PrivateRoute>} />
          <Route path="/interview/setup" element={<PrivateRoute><InterviewSetup /></PrivateRoute>} />
          <Route path="/interview/:sessionId" element={<PrivateRoute><InterviewRoom /></PrivateRoute>} />
          <Route path="/interview/:sessionId/feedback" element={<PrivateRoute><FeedbackScreen /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
