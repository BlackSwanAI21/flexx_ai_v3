import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, Share2, Pencil, Trash2, History, Calendar } from 'lucide-react';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    createdAt: string;
    config: string;
    webhookSecret: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

export function AgentCard({ agent, onEdit, onDelete, onShare }: AgentCardProps) {
  const navigate = useNavigate();
  const config = JSON.parse(agent.config);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bot className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {agent.name}
              </h3>
              <p className="text-sm text-gray-500">{config.model}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/chat/${agent.id}`)}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="Chat with agent"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate(`/chat/${agent.id}/history`)}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="View chat history"
            >
              <History className="h-5 w-5" />
            </button>
            <button
              onClick={onShare}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="Share with client"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
              title="Edit agent"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete agent"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1.5" />
          Created {new Date(agent.createdAt).toLocaleDateString()}
        </div>
        <div className="mt-2 text-sm text-gray-500 font-mono">
          ID: {config.assistantId}
        </div>
      </div>
    </div>
  );
}