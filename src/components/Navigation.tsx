import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Plus, List, Home, Settings, Bell, Code } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useNotifications } from '../lib/notifications-context';
import { NotificationPanel } from './NotificationPanel';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

function NavItem({ to, icon, children, isActive }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-indigo-800 text-white'
          : 'text-indigo-100 hover:bg-indigo-700'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: 'mr-3 h-5 w-5',
      })}
      {children}
    </Link>
  );
}

export function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">AI Agent Hub</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavItem
                  to="/dashboard"
                  icon={<Home />}
                  isActive={location.pathname === '/dashboard'}
                >
                  Dashboard
                </NavItem>
                <NavItem
                  to="/agents/create"
                  icon={<Plus />}
                  isActive={location.pathname === '/agents/create'}
                >
                  Create Agent
                </NavItem>
                <NavItem
                  to="/agents"
                  icon={<List />}
                  isActive={location.pathname === '/agents'}
                >
                  My Agents
                </NavItem>
                <NavItem
                  to="/settings"
                  icon={<Settings />}
                  isActive={location.pathname === '/settings'}
                >
                  Settings
                </NavItem>
                <NavItem
                  to="/api"
                  icon={<Code />}
                  isActive={location.pathname === '/api'}
                >
                  API
                </NavItem>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-indigo-100 hover:text-white p-1"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onMarkAsRead={markAsRead}
              />
            </div>
            <span className="text-indigo-100">
              {user?.name || user?.email}
            </span>
            <button
              onClick={() => logout()}
              className="flex items-center text-indigo-100 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}