// src/App.tsx
import React, { useEffect, useState } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ThemeToggle from './components/context/ThemeToggle';
import './App.css';

type AppView = 'login' | 'register' | 'chat';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setCurrentView('chat');
    }
  }, []);

  const handleNavigateToRegister = () => {
    setCurrentView('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    if (isLoggedIn && currentView === 'chat') {
      return <ChatContainer onLogout={handleLogout} />;
    }
    
    switch (currentView) {
      case 'register':
        return (
          <Register 
            onNavigateToLogin={handleNavigateToLogin}
            onRegisterSuccess={handleLoginSuccess}
          />
        );
      case 'login':
      default:
        return (
          <Login 
            onNavigateToRegister={handleNavigateToRegister}
            onLoginSuccess={handleLoginSuccess}
          />
        );
    }
  };

  return (
    <div className="app">
      <ThemeToggle />
      {renderCurrentView()}
    </div>
  );
};

export default App;
