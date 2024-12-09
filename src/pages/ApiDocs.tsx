import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { Code, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';

interface WebhookPayload {
  timestamp: string;
  payload: any;
}

export function ApiDocsPage() {
  const webhookUrl = `${window.location.origin}/api/webhook`;
  const [payloads, setPayloads] = useState<WebhookPayload[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isPolling) {
      // Poll for new webhook data every 2 seconds
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/webhook-logs');
          if (!response.ok) {
            throw new Error('Failed to fetch webhook logs');
          }
          const data = await response.json();
          setPayloads(data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch webhook logs');
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isPolling]);

  const startPolling = () => {
    setIsPolling(true);
  };

  const stopPolling = () => {
    setIsPolling(false);
  };

  const clearPayloads = () => {
    setPayloads([]);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center">
              <Code className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-lg font-medium text-gray-900">API Documentation</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Learn how to integrate with our API endpoints
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Webhook Testing Section */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Live Webhook Testing</h2>
                <div className="space-x-2">
                  <Button
                    onClick={isPolling ? stopPolling : startPolling}
                    variant={isPolling ? 'secondary' : 'primary'}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
                    {isPolling ? 'Stop' : 'Start'} Monitoring
                  </Button>
                  <Button onClick={clearPayloads} variant="secondary">
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="text-sm font-medium text-gray-700">Incoming Webhook Payloads</h3>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {error ? (
                    <div className="px-4 py-3 text-sm text-red-600 bg-red-50">
                      {error}
                    </div>
                  ) : payloads.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No webhook payloads received yet. Start monitoring to see incoming requests.
                    </div>
                  ) : (
                    payloads.map((item, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <pre className="bg-gray-50 p-3 rounded-lg text-sm overflow-x-auto">
                          {JSON.stringify(item.payload, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* API Documentation */}
            <section>
              <h2 className="text-lg font-medium text-gray-900">Webhook Endpoint</h2>
              <p className="mt-1 text-sm text-gray-500">
                Send messages to your AI agents via webhook
              </p>

              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-indigo-600 text-white text-sm rounded">POST</span>
                  <code className="text-sm">{webhookUrl}</code>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Request Body</h3>
                  <div className="mt-2 bg-gray-100 p-3 rounded">
                    <pre className="text-sm overflow-x-auto">
{`{
  "Lead Response": "User message",
  "app email": "user@example.com",
  "Active Assistant ID": "asst_xxx",
  "Assistant Memory Id": "thread_xxx" // Optional
}`}
                    </pre>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Response</h3>
                  <div className="mt-2 bg-gray-100 p-3 rounded">
                    <pre className="text-sm overflow-x-auto">
{`{
  "response": "AI assistant response",
  "threadId": "thread_xxx"
}`}
                    </pre>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Notes:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>If no Assistant Memory Id is provided, a new thread will be created</li>
                    <li>Include Assistant Memory Id to continue an existing conversation</li>
                    <li>The app email must match a registered user's email</li>
                    <li>The Active Assistant ID must match one of your AI agents</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium text-gray-900">Rate Limits</h2>
              <div className="mt-2 text-sm text-gray-500">
                <ul className="list-disc list-inside space-y-1">
                  <li>Maximum 100 requests per second</li>
                  <li>Maximum message length: 4096 characters</li>
                  <li>Responses may take 1-5 seconds depending on the AI model</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}