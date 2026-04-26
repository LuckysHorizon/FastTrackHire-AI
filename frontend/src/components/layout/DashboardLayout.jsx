import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, History, FileText, Settings, LogOut, Search } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Intelligence', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Sessions', icon: History, path: '/sessions' },
    { label: 'Resumes', icon: FileText, path: '/resume' },
    { label: 'Simulation', icon: Settings, path: '/interview/setup' },
  ];

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-bg-muted flex flex-col bg-bg-surface">
        <div className="p-8 pb-12">
          <h1 className="font-serif text-[24px] font-bold text-accent">FastTrackHire</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-text-tertiary mt-1">Editorial Precision</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-[14px] font-medium transition-all group ${
                  isActive 
                    ? 'bg-accent text-text-inverse shadow-sm' 
                    : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-text-inverse' : 'text-text-tertiary group-hover:text-text-primary'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-bg-muted">
          <div className="flex items-center px-4 py-4 mb-2 bg-bg-subtle rounded-xl">
             <Avatar size="sm" fallback={user?.full_name?.charAt(0)} className="mr-3" />
             <div className="flex-1 min-w-0">
               <p className="text-[13px] font-semibold text-text-primary truncate">{user?.full_name}</p>
               <p className="text-[11px] text-text-tertiary truncate">{user?.email}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-[14px] font-medium text-error hover:bg-error-light transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[72px] border-b border-bg-muted bg-bg-surface/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center text-text-secondary text-[14px]">
            <span className="font-medium text-text-primary mr-2">Overview</span>
            <span className="mx-2">/</span>
            <span className="text-text-tertiary">Real-time Intelligence</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search sessions..." 
                className="bg-bg-subtle border-none rounded-full pl-9 pr-4 py-2 text-[13px] w-[220px] focus:ring-1 focus:ring-accent transition-all outline-none"
              />
            </div>
            <Avatar fallback={user?.full_name?.charAt(0)} className="ring-2 ring-bg-muted hover:ring-accent transition-all cursor-pointer" />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
