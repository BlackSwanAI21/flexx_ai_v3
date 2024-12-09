import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { db_operations } from '../lib/db';
import { useAuth } from '../lib/auth-context';
import { Calendar, MessageSquare } from 'lucide-react';

interface ChatSession {
  id: string;
  createdAt: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }>;
}

export function ChatHistoryPage() {
  const { agentId } = useParams();
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user || !agentId) return;

      try {
        // Load agent details
        const agents = await db_operations.getAgentsByUser(user.id);
        const currentAgent = agents.find(a => a.id === agentId);
        setAgent(currentAgent);

        // Load all chat sessions for this agent
        const chats = await db_operations.getChatsByAgent(agentId);
        const sessionsWithMessages = await Promise.all(
          chats.map(async (chat) => {
            const messages = await db_operations.getMessagesByChat(chat.id);
            return {
              id: chat.id,
              createdAt: chat.createdAt,
              messages,
            };
          })
        );

        setChatSessions(sessionsWithMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [user, agentId]);

  if (isLoading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Chat History - {agent?.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View past conversations with this AI agent
            </p>
          </div>

          <div className="flex h-[calc(100vh-16rem)]">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedChat(session.id)}
                  className={`w-full px-4 py-3 flex items-start hover:bg-gray-50 ${
                    selectedChat === session.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(session.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {session.messages.length} messages
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedChat ? (
                <div className="space-y-4">
                  {chatSessions
                    .find(session => session.id === selectedChat)
                    ?.messages.map((message, index) => (
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
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a chat session to view the conversation
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}