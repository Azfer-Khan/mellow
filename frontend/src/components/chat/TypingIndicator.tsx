// src/components/chat/TypingIndicator.tsx
import React from 'react';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  isTyping: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping }) => {
  if (!isTyping) return null;
  return (
    <div className="typing-indicator">
      <span>Mellow is typing...</span>
    </div>
  );
};

export default TypingIndicator;
