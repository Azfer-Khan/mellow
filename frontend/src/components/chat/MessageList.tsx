// src/components/chat/MessageList.tsx
import React from 'react';
import { Message } from './MessageBubble';
import MessageBubble from './MessageBubble';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
    </div>
  );
};

export default MessageList;
