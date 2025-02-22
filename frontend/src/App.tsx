import React, { useState } from 'react';
import './App.css';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  // Handle sending a message
  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: input };
    // Append user's message
    setMessages(prev => [...prev, userMessage]);

    // Simulate an AI response after a short delay.
    setTimeout(() => {
      const aiMessage: Message = { sender: 'ai', text: "I'm here to listen. You said: '" + input + "'" };
      setMessages(prev => [...prev, aiMessage]);
    }, 500);

    setInput('');
  };

  // Allow sending message with the Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="input-container">
          <input 
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
