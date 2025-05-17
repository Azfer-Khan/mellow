// src/components/chat/InputArea.tsx
import React, { useState, KeyboardEvent } from 'react';
import './InputArea.css';

interface InputAreaProps {
  onSend: (text: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <input
        type="text"
        value={inputText}
        placeholder="Type your message..."
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyPress}
        autoFocus
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default InputArea;
