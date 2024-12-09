import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TypingBubble } from '../components/TypingBubble';
import { Button } from '../components/Button';
import { db_operations } from '../lib/db';
import { createThread, sendMessage } from '../lib/openai';
import { Send, Loader2, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function PublicChatPage() {
  const { username, agentName } = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAgent = async () => {
      try {
        // Find user by username
        const users = await db_operations.users.toArray();
        const user = users.find(u => u.name?.toLowerCase() === username?.toLowerCase());
        
        if (!user) {
          setError('User not found');
          return;
        }

        // Find agent by name for this user
        const agents = await db_operations.getAgentsByUser(user.id);
        const currentAgent = agents.find(
          a => a.name.toLowerCase().replace(/\s+/g, '-') === agentName?.toLowerCase()
        );

        if (!currentAgent) {
          setError('AI Agent not found');
          return;
        }

        setAgent(currentAgent);
        const newThreadId = await createThread(user.id);
        setThreadId(newThreadId);
      } catch (error) {
        setError('Failed to load AI Agent');
        console.error('Error loading agent:', error);
      }
    };

    loadAgent();
  }, [username, agentName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !agent || !threadId) return;

    setIsLoading(true);
    try {
      const config = JSON.parse(agent.config);
      const user = await db_operations.findUserById(agent.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Add user message to the UI
      setMessages(prev => [...prev, { role: 'user', content: newMessage }]);
      setNewMessage('');

      // Send message to OpenAI
      const response = await sendMessage(
        user.id,
        threadId,
        config.assistantId,
        newMessage
      );

      // Add assistant response to the UI
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!agent) return;
    
    setIsResetting(true);
    try {
      setMessages([]);
      const newThreadId = await createThread(agent.userId);
      setThreadId(newThreadId);
    } catch (error) {
      console.error('Failed to reset chat:', error);
      setError('Failed to reset chat. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        <div className="bg-white shadow rounded-lg flex flex-col h-[calc(100vh-4rem)]">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Chat with {agent.name}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && <TypingBubble />}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={isLoading || isResetting}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || isResetting || !newMessage.trim()}
                isLoading={isLoading}
                className="w-full"
              >
                {!isLoading && <Send className="h-5 w-5" />}
              </Button>
              <button
                onClick={handleReset}
                disabled={isLoading || isResetting}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center space-x-1 py-2"
              >
                <RefreshCw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}