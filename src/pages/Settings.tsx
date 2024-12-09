import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../lib/auth-context';
import { db_operations } from '../lib/db';
import { Key, ExternalLink } from 'lucide-react';

export function SettingsPage() {
  const { user, login: updateUser } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updatedUser = await db_operations.updateUser(user.id, {
        openaiApiKey: apiKey
      });
      
      if (updatedUser) {
        updateUser({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name
        });
        setSuccess(true);
        setApiKey('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
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
              API Settings
            </h3>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {message && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  OpenAI API Key
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  To use AI agents, you need to provide your OpenAI API key. You can find your API key in your{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500 inline-flex items-center"
                  >
                    OpenAI dashboard
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <Input
                    label="API Key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    required
                  />

                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">
                      API key saved successfully!
                    </div>
                  )}

                  <Button type="submit" isLoading={isLoading}>
                    Save API Key
                  </Button>
                </form>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900">Important Notes:</h4>
                <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Your API key is stored securely in your browser's local database</li>
                  <li>The key is only used for communicating with OpenAI's API</li>
                  <li>You can update or remove your API key at any time</li>
                  <li>Make sure to keep your API key confidential</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}