import { useState } from 'react';
import type { PageKey } from '@/types';
import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/context/ToastContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { RoutesPage } from '@/pages/RoutesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AboutPage } from '@/pages/AboutPage';

function AppShell() {
  const [page, setPage] = useState<PageKey>('dashboard');
  const handleNavigate = (next: PageKey) => setPage(next);

  return (
    <Layout current={page} onNavigate={handleNavigate}>
      {page === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {page === 'routes' && <RoutesPage onNavigate={handleNavigate} />}
      {page === 'reports' && <ReportsPage />}
      {page === 'notifications' && <NotificationsPage />}
      {page === 'about' && <AboutPage />}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
