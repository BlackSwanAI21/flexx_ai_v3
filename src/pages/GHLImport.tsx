import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../lib/auth-context';
import { db_operations } from '../lib/db';
import { setupGHLIntegration } from '../lib/ghl';
import { AlertCircle, Check } from 'lucide-react';

export function GHLImportPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [locationId, setLocationId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [openingMessage, setOpeningMessage] = useState(
    "Hi it's Sarah from Company Name, is that the same {{contact.first_name}} who was interested in product/service?"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      if (!user) return;
      const userAgents = await db_operations.getAgentsByUser(user.id);
      setAgents(userAgents);
    };

    loadAgents();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const agent = agents.find(a => a.id === selectedAgent);
      if (!agent) {
        throw new Error('Selected agent not found');
      }

      const config = JSON.parse(agent.config);
      
      await setupGHLIntegration(
        apiKey,
        locationId,
        config.assistantId,
        openingMessage,
        user?.email || ''
      );

      setSuccess(true);
      // Reset form
      setSelectedAgent('');
      setLocationId('');
      setApiKey('');
      setOpeningMessage("Hi it's Sarah from Company Name, is that the same {{contact.first_name}} who was interested in product/service?");
    } catch (error) {
      console.error('GHL Import error:', error);
      setError(error instanceof Error ? error.message : 'Failed to import to GHL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Import AI Agent to GoHighLevel
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Connect your AI agent with your GoHighLevel account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-5 space-y-6 sm:p-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border-l-4 border-green-400 text-green-700">
                <div className="flex">
                  <Check className="h-5 w-5 mr-2" />
                  <p className="text-sm">Successfully imported to GHL!</p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Select AI Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select an agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  label="Location ID"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  placeholder="e.g., ISax3DSxFxETSEPGma5u1"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Find your Location ID in the URL: app.gohighlevel.com/v2/location/[Location ID]/dashboard
                </p>
              </div>

              <div>
                <Input
                  label="API Key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Found in Settings {'->'} Business Profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Opening Message
                </label>
                <textarea
                  value={openingMessage}
                  onChange={(e) => setOpeningMessage(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                Import to GHL
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}