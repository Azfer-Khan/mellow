// src/components/chat/ChatContainer.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import { Message } from './MessageBubble';
import config from '../../config';
import './ChatContainer.css';

interface ChatContainerProps {
  onLogout?: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ onLogout }) => {
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
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use the config API URL and add authentication headers
      const response = await axios.post(`${config.apiUrl}/chat`, 
        { message: text },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const aiResponseText = response.data.response;

      const aiMessage: Message = {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error calling the backend API:", error);
      
      let errorMessage = "Oops, something went wrong. Please try again.";
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
        // Automatically logout on authentication error
        if (onLogout) {
          setTimeout(() => onLogout(), 2000);
        }
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to access this feature.";
      } else if (error.message === 'No authentication token found') {
        errorMessage = "Please log in to continue chatting.";
        if (onLogout) {
          setTimeout(() => onLogout(), 1000);
        }
      }
      
      const errorMessageObj: Message = {
        sender: 'ai',
        text: errorMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`chat-container ${isElectron ? 'electron-app' : ''}`}>
      <div className="chat-header">
        <h2>MellowMind</h2>
        {onLogout && (
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
      <MessageList messages={messages} />
      <TypingIndicator isTyping={isTyping} />
      <InputArea onSend={sendMessage} />
    </div>
  );
};

export default ChatContainer;
