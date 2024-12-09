import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { Button } from '../components/Button';
import { TypingBubble } from '../components/TypingBubble';
import { FeedbackSection } from '../components/FeedbackSection';
import { useAuth } from '../lib/auth-context';
import { db_operations } from '../lib/db';
import { createThread, sendMessage } from '../lib/openai';
import { Send, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPage() {
  const { agentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAgent = async () => {
      if (!user || !agentId) return;

      try {
        const agents = await db_operations.getAgentsByUser(user.id);
        const currentAgent = agents.find(a => a.id === agentId);

        if (!currentAgent) {
          navigate('/agents');
          return;
        }

        setAgent(currentAgent);

        // Create a new thread
        const newThreadId = await createThread(user.id);
        setThreadId(newThreadId);

        // Create a new chat session
        const chat = await db_operations.createChat({
          agentId,
          userId: user.id,
          threadId: newThreadId
        });
        setCurrentChatId(chat.id);

        // Load existing feedbacks for this agent
        const existingFeedbacks = await db_operations.getFeedbacksByAgent(agentId);
        setFeedbacks(existingFeedbacks);
      } catch (error) {
        console.error('Error loading agent:', error);
      }
    };

    loadAgent();
  }, [user, agentId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !agent || !threadId || !user) return;

    setIsLoading(true);
    try {
      const config = JSON.parse(agent.config);

      // Add user message to the UI
      setMessages(prev => [...prev, { role: 'user', content: newMessage }]);

      // Save user message to database
      if (currentChatId) {
        await db_operations.addMessage({
          chatId: currentChatId,
          role: 'user',
          content: newMessage
        });
      }

      const userMessage = newMessage;
      setNewMessage('');

      // Send message to OpenAI
      const response = await sendMessage(
        user.id,
        threadId,
        config.assistantId,
        userMessage
      );

      // Add assistant response to the UI
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Save assistant message to database
      if (currentChatId) {
        await db_operations.addMessage({
          chatId: currentChatId,
          role: 'assistant',
          content: response
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!agent || !user) return;
    
    setIsResetting(true);
    try {
      setMessages([]);
      
      // Create new thread
      const newThreadId = await createThread(user.id);
      setThreadId(newThreadId);

      // Create new chat session
      const chat = await db_operations.createChat({
        agentId: agent.id,
        userId: user.id,
        threadId: newThreadId
      });
      setCurrentChatId(chat.id);
    } catch (error) {
      console.error('Failed to reset chat:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: any) => {
    if (!currentChatId || !agent) return;
    await db_operations.addFeedback({
      ...feedback,
      agentId: agent.id,
      chatId: currentChatId
    });
    const updatedFeedbacks = await db_operations.getFeedbacksByAgent(agent.id);
    setFeedbacks(updatedFeedbacks);
  };

  if (!agent) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg flex flex-col h-[calc(100vh-12rem)]">
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

            {currentChatId && agent && (
              <div className="mt-6">
                <FeedbackSection
                  agentId={agent.id}
                  chatId={currentChatId}
                  onSubmit={handleFeedbackSubmit}
                  feedbacks={feedbacks}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}