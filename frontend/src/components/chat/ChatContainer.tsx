// src/components/chat/ChatContainer.tsx
import React, { useState } from 'react';
import axios from 'axios';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import { Message } from './MessageBubble';
import './ChatContainer.css';

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const sendMessage = async (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const userMessage: Message = { sender: 'user', text, timestamp };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);

    try {
      // Replace the simulated response with an API call
      const response = await axios.post('http://localhost:3000/chat', { message: text });
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
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with MellowMind AI</h2>
      </div>
      <MessageList messages={messages} />
      <TypingIndicator isTyping={isTyping} />
      <InputArea onSend={sendMessage} />
    </div>
  );
};

export default ChatContainer;
