import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FlexxTemplateForm } from '../components/FlexxTemplateForm';
import { useAuth } from '../lib/auth-context';
import { db_operations } from '../lib/db';
import { createOpenAIAssistant } from '../lib/openai';

const AI_MODELS = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex tasks'
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    description: 'Fast and powerful model with latest capabilities'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective for simpler tasks'
  }
];

export function CreateAgentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFlexxTemplate, setShowFlexxTemplate] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    model: '',
    prompt: ''
  });

  useEffect(() => {
    const checkApiKey = async () => {
      if (!user) return;
      
      const userData = await db_operations.findUserById(user.id);
      if (!userData?.openaiApiKey) {
        navigate('/settings', { 
          state: { 
            message: 'Please add your OpenAI API key before creating an AI agent' 
          }
        });
      }
    };

    checkApiKey();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const data = {
        name: formData.clientName,
        description: formData.prompt,
        model: formData.model,
      };

      // Create OpenAI Assistant
      const assistantId = await createOpenAIAssistant(
        user.id,
        data.name,
        data.description,
        data.model
      );

      // Save agent to local database
      const config = JSON.stringify({
        model: data.model,
        prompt: data.description,
        assistantId
      });

      await db_operations.createAgent({
        name: data.name,
        description: data.description,
        config,
        userId: user.id,
      });

      navigate('/agents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlexxTemplateSubmit = (prompt: string) => {
    setFormData(prev => ({ ...prev, prompt }));
    setShowFlexxTemplate(false);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Create New AI Agent
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure a new AI agent for your client
            </p>
          </div>

          {!showFlexxTemplate ? (
            <div className="px-4 py-5 space-y-6 sm:p-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="button"
                onClick={() => setShowFlexxTemplate(true)}
                variant="secondary"
                className="w-full"
              >
                Use Flexx Generic Template
              </Button>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Client Name"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700">AI Model</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a model...</option>
                    {AI_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prompt</label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    rows={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" isLoading={isLoading}>
                    Create Agent
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6">
              <FlexxTemplateForm onSubmit={handleFlexxTemplateSubmit} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}