// src/App.tsx
import React from 'react';
import ChatContainer from './components/chat/ChatContainer';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>MellowMind</h1>
      <ChatContainer />
    </div>
  );
};

export default App;
