// src/App.tsx
import React, { useEffect, useState } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import Login from './components/auth/Login';
import ThemeToggle from './components/context/ThemeToggle';
import './App.css';

const App: React.FC = () => {
  // For demonstration, we'll add a simple state to toggle between login and chat
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div className="app">
      <ThemeToggle />
      {isLoggedIn ? <ChatContainer /> : <Login />}
    </div>
  );
};

export default App;
