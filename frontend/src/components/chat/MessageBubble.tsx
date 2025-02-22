// src/components/chat/MessageBubble.tsx
import React from 'react';
import './MessageBubble.css';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`message-bubble ${message.sender}`}>
      <div className="bubble-text">{message.text}</div>
      {message.timestamp && (
        <div className="bubble-timestamp">{message.timestamp}</div>
      )}
    </div>
  );
};

export default MessageBubble;
