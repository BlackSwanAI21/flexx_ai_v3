import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { MainLayout } from '../components/MainLayout';
import { Plus, List, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db_operations } from '../lib/db';

export function DashboardPage() {
  const { user } = useAuth();
  const [totalAgents, setTotalAgents] = useState(0);
  const [activeChats, setActiveChats] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      // Get total agents
      const agents = await db_operations.getAgentsByUser(user.id);
      setTotalAgents(agents.length);

      // Get active chats
      const chatCount = await db_operations.getChatCount(user.id);
      setActiveChats(chatCount);
    };

    loadStats();
  }, [user]);

  return (
    <MainLayout>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'there'}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your AI agents and create new ones from here.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Link
          to="/agents/create"
          className="relative block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Plus className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Create New Agent</h2>
              <p className="mt-1 text-sm text-gray-500">
                Build a new AI agent for your clients
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/agents"
          className="relative block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <List className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">View All Agents</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your existing AI agents
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/ghl-import"
          className="relative block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Download className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Import to GHL</h2>
              <p className="mt-1 text-sm text-gray-500">
                Import your AI agents to GoHighLevel
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12">
        <div className="rounded-lg bg-white shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-gray-50 px-4 py-5 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{totalAgents}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Chats</dt>
                <dd className="mt-1 text-3xl font-semibold text-indigo-600">{activeChats}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}