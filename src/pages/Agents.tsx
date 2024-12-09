import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/MainLayout';
import { useAuth } from '../lib/auth-context';
import { db_operations } from '../lib/db';
import { AIAgent } from '../lib/db';
import { deleteOpenAIAssistant, updateOpenAIAssistant } from '../lib/openai';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { ShareDialog } from '../components/ShareDialog';
import { AgentCard } from '../components/AgentCard';

interface EditDialogProps {
  agent: AIAgent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; model: string; prompt: string }) => Promise<void>;
}

const AI_MODELS = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
  }
];

function EditDialog({ agent, isOpen, onClose, onSave }: EditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const config = JSON.parse(agent.config);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    await onSave({
      name: formData.get('name') as string,
      model: formData.get('model') as string,
      prompt: formData.get('prompt') as string,
    });
    
    setIsLoading(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit AI Agent">
      <form onSubmit={handleSubmit} className="space-y-4">
        {showSuccess && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="h-6 w-6" />
              <span className="text-lg font-medium">Changes saved!</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={agent.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <select
            name="model"
            defaultValue={config.model}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            {AI_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prompt</label>
          <textarea
            name="prompt"
            defaultValue={config.prompt}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [sharingAgent, setSharingAgent] = useState<AIAgent | null>(null);

  useEffect(() => {
    loadAgents();
  }, [user]);

  async function loadAgents() {
    if (!user) return;
    try {
      const userAgents = await db_operations.getAgentsByUser(user.id);
      setAgents(userAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(agentId: string, assistantId: string) {
    if (!user || !window.confirm('Are you sure you want to delete this agent?')) return;

    setDeleteLoading(agentId);
    try {
      await deleteOpenAIAssistant(user.id, assistantId);
      await db_operations.deleteAgent(agentId);
      await loadAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  }

  async function handleEdit(data: { name: string; model: string; prompt: string }) {
    if (!editingAgent || !user) return;

    try {
      const config = JSON.parse(editingAgent.config);
      
      await updateOpenAIAssistant(
        user.id,
        config.assistantId,
        data.name,
        data.prompt,
        data.model
      );

      const newConfig = JSON.stringify({
        ...config,
        model: data.model,
        prompt: data.prompt,
      });

      await db_operations.updateAgent(editingAgent.id, {
        name: data.name,
        config: newConfig,
      });

      await loadAgents();
    } catch (error) {
      console.error('Failed to update agent:', error);
      alert('Failed to update agent. Please try again.');
      throw error;
    }
  }

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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">My AI Agents</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all your AI agents and their current status
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => setEditingAgent(agent)}
              onDelete={() => {
                const config = JSON.parse(agent.config);
                handleDelete(agent.id, config.assistantId);
              }}
              onShare={() => setSharingAgent(agent)}
            />
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center mt-12">
            <Bot className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new AI agent.
            </p>
          </div>
        )}

        {editingAgent && (
          <EditDialog
            agent={editingAgent}
            isOpen={true}
            onClose={() => setEditingAgent(null)}
            onSave={handleEdit}
          />
        )}

        {sharingAgent && (
          <ShareDialog
            isOpen={true}
            onClose={() => setSharingAgent(null)}
            agentName={sharingAgent.name}
            agentId={sharingAgent.id}
          />
        )}
      </div>
    </MainLayout>
  );
}