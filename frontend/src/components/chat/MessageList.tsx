// src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { Message } from './MessageBubble';
import MessageBubble from './MessageBubble';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a resize observer to handle window resizing
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (messageListRef.current) {
        scrollToBottom();
      }
    });

    if (messageListRef.current) {
      resizeObserver.observe(messageListRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="message-list" ref={messageListRef}>
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <>
          {/* Add a divider if there are historical messages and current session messages */}
          {messages.some(msg => msg.isHistorical) && messages.some(msg => !msg.isHistorical) && (
            <div className="conversation-divider">
              <span>Current Session</span>
            </div>
          )}
          {messages.map((msg, index) => {
            // Add a divider before the first current session message
            const isFirstCurrentMessage = !msg.isHistorical && 
              index > 0 && messages[index - 1].isHistorical;
            
            return (
              <React.Fragment key={index}>
                {isFirstCurrentMessage && (
                  <div className="conversation-divider">
                    <span>Current Session</span>
                  </div>
                )}
                <MessageBubble message={msg} />
              </React.Fragment>
            );
          })}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
