// src/App.tsx
import React, { useEffect } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import ThemeToggle from './components/context/ThemeToggle';
import MoodJournal from './components/journal/MoodJournal';
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
      <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        <ChatContainer />
        <MoodJournal />
      </div>
    </div>
  );
};

export default App;
