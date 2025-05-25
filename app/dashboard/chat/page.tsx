'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ActionButton } from '@/components/ui';

// Message interface
interface Message {
  id: string;
  sender: 'user' | 'admin';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'admin',
      content: 'Bună ziua! Cum vă putem ajuta astăzi?',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate admin typing and response after user sends a message
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    let responseTimeout: NodeJS.Timeout;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'user') {
      // Show typing indicator after user sends a message
      setIsTyping(true);

      // Simulate admin response after delay
      typingTimeout = setTimeout(() => {
        const responses = [
          'Mulțumim pentru mesaj! Vom analiza cererea dumneavoastră și vă vom răspunde în curând.',
          'Vom transmite informațiile către departamentul responsabil și vă vom contacta cu un răspuns.',
          'Înțelegem solicitarea dumneavoastră. Un specialist va reveni cu informații suplimentare.',
          'Apreciem mesajul dumneavoastră. Vom reveni cu un răspuns detaliat în cel mai scurt timp.'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        responseTimeout = setTimeout(() => {
          setIsTyping(false);
          addMessage('admin', randomResponse);
        }, 1500);
      }, 1000);
    }

    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(responseTimeout);
    };
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (sender: 'user' | 'admin', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMessage.trim() === '') return;

    addMessage('user', inputMessage);
    setInputMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="pb-4">
          <h1 className="text-2xl font-bold mb-2">Chat cu Asistență</h1>
          <p className="text-text-primary">Contactați echipa noastră pentru orice întrebare sau asistență</p>
        </div>

        <div className="dashboard-card flex flex-col flex-grow overflow-hidden">
          <div className="p-4 border-b border-border-color flex items-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold">Asistență SEO Doctor</h2>
              <p className="text-xs text-text-primary">Online acum</p>
            </div>
          </div>

          {/* Messages container */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-dark-blue-lighter rounded-tl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-text-primary'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-dark-blue-lighter rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-text-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-text-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-text-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border-color flex gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Scrieți un mesaj..."
              className="flex-1 bg-dark-blue-lighter border border-border-color rounded-md px-4 py-2 focus:outline-none focus:border-primary"
            />
            <ActionButton
              type="submit"
              size="sm"
              disabled={inputMessage.trim() === ''}
              showArrow={false}
              fullRounded={false}
            >
              Trimite
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </ActionButton>
          </form>
        </div>

        <div className="mt-4 p-4 bg-dark-blue-lighter rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Alte modalități de contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-dark-blue p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-text-primary">Email</p>
                <p className="font-medium">contact@seodoctor.ro</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-dark-blue p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-text-primary">Telefon</p>
                <p className="font-medium">+40 742 702 982</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}