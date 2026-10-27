import { useState } from 'react';
import {
  LayoutDashboard,
  Bus,
  MessageSquareWarning,
  Bell,
  Info,
  Menu,
  X,
  Bus as BusIcon,
} from 'lucide-react';
import type { PageKey } from '@/types';
import { useApp } from '@/context/AppContext';
import { todayLong } from '@/lib/format';
import { cn } from '@/lib/cn';

interface LayoutProps {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
  children: React.ReactNode;
}

const NAV: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'routes', label: 'Bus Routes', icon: <Bus size={18} /> },
  { key: 'reports', label: 'Crowd Reports', icon: <MessageSquareWarning size={18} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { key: 'about', label: 'About Project', icon: <Info size={18} /> },
];

const TITLES: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  routes: 'Bus Routes',
  reports: 'Crowd Reports',
  notifications: 'Notifications',
  about: 'About Project',
};

export function Layout({ current, onNavigate, children }: LayoutProps) {
  const { unreadCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#0f1f3d] text-gray-300">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <BusIcon size={20} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Smart College Bus</p>
          <p className="text-xs text-gray-400">Management System</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = item.key === current;
          const showBadge =
            item.key === 'notifications' && unreadCount > 0;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNav(item.key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span className={cn(active ? 'text-white' : 'text-gray-400')}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {showBadge && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-gray-400">
        <p>College project prototype</p>
        <p className="mt-0.5">Data is stored locally in your browser.</p>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebar}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {TITLES[current]}
            </h1>
            <p className="hidden text-xs text-gray-500 sm:block">
              {todayLong()}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('notifications')}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
