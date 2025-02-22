// src/components/chat/ChatContainer.tsx
import React, { useState } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import { Message } from './MessageBubble';
import './ChatContainer.css';

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const sendMessage = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const userMessage: Message = { sender: 'user', text, timestamp };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response: show typing indicator and then add response
    setIsTyping(true);
    setTimeout(() => {
      const aiMessage: Message = {
        sender: 'ai',
        text: `I'm here to listen. You said: "${text}"`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <TypingIndicator isTyping={isTyping} />
      <InputArea onSend={sendMessage} />
    </div>
  );
};

export default ChatContainer;
