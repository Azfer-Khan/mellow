// src/App.tsx
import React, { useEffect } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div className="app">
      <ThemeToggle />
      <ChatContainer />
    </div>
  );
};

export default App;
