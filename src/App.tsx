import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { NotificationsProvider } from './lib/notifications-context';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { CreateAgentPage } from './pages/CreateAgent';
import { AgentsPage } from './pages/Agents';
import { ChatPage } from './pages/Chat';
import { ChatHistoryPage } from './pages/ChatHistory';
import { PublicChatPage } from './pages/PublicChat';
import { GHLImportPage } from './pages/GHLImport';
import { ApiDocsPage } from './pages/ApiDocs';
import { useAuth } from './lib/auth-context';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <PrivateRoute>
                  <AgentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/agents/create"
              element={
                <PrivateRoute>
                  <CreateAgentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat/:agentId"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat/:agentId/history"
              element={
                <PrivateRoute>
                  <ChatHistoryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/ghl-import"
              element={
                <PrivateRoute>
                  <GHLImportPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/api"
              element={
                <PrivateRoute>
                  <ApiDocsPage />
                </PrivateRoute>
              }
            />
            <Route path="/:username/:agentName" element={<PublicChatPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}