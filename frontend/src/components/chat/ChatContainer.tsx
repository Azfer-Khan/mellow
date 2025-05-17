// src/components/chat/ChatContainer.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import { Message } from './MessageBubble';
import './ChatContainer.css';

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isElectron, setIsElectron] = useState<boolean>(false);

  // Check if running in Electron
  useEffect(() => {
    // @ts-ignore - window.electron is injected by preload.js
    if (window.electron) {
      setIsElectron(true);
    }
  }, []);

  const sendMessage = async (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const userMessage: Message = { sender: 'user', text, timestamp };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);

    try {
      // Use relative path to leverage nginx proxy in production or direct API in development
      const apiUrl = process.env.REACT_APP_API_URL || '/api/chat';
      const response = await axios.post(apiUrl, { message: text });
      const aiResponseText = response.data.response;

      const aiMessage: Message = {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling the backend API:", error);
      const errorMessage: Message = {
        sender: 'ai',
        text: "Oops, something went wrong. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`chat-container ${isElectron ? 'electron-app' : ''}`}>
      <div className="chat-header">
        <h2>MellowMind</h2>
      </div>
      <MessageList messages={messages} />
      <TypingIndicator isTyping={isTyping} />
      <InputArea onSend={sendMessage} />
    </div>
  );
};

export default ChatContainer;
