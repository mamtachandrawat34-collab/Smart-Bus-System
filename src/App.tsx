import { useState } from 'react';
import type { PageKey } from '@/types';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { RoutesPage } from '@/pages/RoutesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AdminDashboard } from '@/pages/AdminDashboard';

function AppShell() {
  const { session, loading } = useAuth();
  const [page, setPage] = useState<PageKey>('dashboard');
  const handleNavigate = (next: PageKey) => setPage(next);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <Layout current={page} onNavigate={handleNavigate}>
        {page === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {page === 'routes' && <RoutesPage onNavigate={handleNavigate} />}
        {page === 'reports' && <ReportsPage />}
        {page === 'notifications' && <NotificationsPage />}
        {page === 'admin' && <AdminDashboard />}
      </Layout>
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
