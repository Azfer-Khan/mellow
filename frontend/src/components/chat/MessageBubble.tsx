// src/components/chat/MessageBubble.tsx
import React from 'react';
import './MessageBubble.css';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
  conversationId?: number;
  isHistorical?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTimestamp = (timestamp: string) => {
    if (message.isHistorical) {
      // For historical messages, show full date and time
      const date = new Date(timestamp);
      return date.toLocaleString();
    } else {
      // For current session messages, show just the time
      return timestamp;
    }
  };

  return (
    <div className={`message-bubble ${message.sender} ${message.isHistorical ? 'historical' : ''}`}>
      <div className="bubble-text">{message.text}</div>
      {message.timestamp && (
        <div className="bubble-timestamp">{formatTimestamp(message.timestamp)}</div>
      )}
    </div>
  );
};

export default MessageBubble;
