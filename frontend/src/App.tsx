// src/App.tsx
import React, { useEffect, useState } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import IntakeFormWizard from './components/intake/IntakeFormWizard';
import ThemeToggle from './components/context/ThemeToggle';
import config from './config';
import './App.css';

type AppView = 'login' | 'register' | 'intake' | 'chat';

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
      checkIntakeStatus();
    }
  }, []);

  const checkIntakeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/auth/intake-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.needs_intake) {
          setCurrentView('intake');
        } else {
          setCurrentView('chat');
        }
      } else {
        setCurrentView('chat'); // Default to chat if we can't check status
      }
    } catch (error) {
      console.error('Error checking intake status:', error);
      setCurrentView('chat'); // Default to chat on error
    }
  };

  const handleNavigateToRegister = () => {
    setCurrentView('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    checkIntakeStatus();
  };

  const handleIntakeComplete = () => {
    setCurrentView('chat');
  };

  const handleIntakeExit = () => {
    setCurrentView('chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    if (isLoggedIn) {
      switch (currentView) {
        case 'intake':
          return (
            <IntakeFormWizard 
              onComplete={handleIntakeComplete}
              onCancel={handleIntakeExit}
            />
          );
        case 'chat':
          return <ChatContainer onLogout={handleLogout} />;
        default:
          return <ChatContainer onLogout={handleLogout} />;
      }
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
