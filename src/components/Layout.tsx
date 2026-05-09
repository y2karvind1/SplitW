import React from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, LayoutDashboard, Plus, Settings, Split } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  setActiveGroupId: (id: string | null) => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, children, setActiveGroupId }) => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-dark border-r border-white/5 p-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 glass flex items-center justify-center rounded-xl">
            <Split size={24} className="text-indigo-400" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">Splitwise Pro</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveGroupId(null)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"
          >
            <LayoutDashboard size={20} className="text-indigo-400" />
            Dashboard
          </button>
        </nav>

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              className="w-10 h-10 rounded-full border border-white/10" 
              alt="Avatar"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-400"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 glass sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Split size={24} className="text-indigo-400" />
            <span className="font-bold font-display text-white">Splitwise Pro</span>
          </div>
          <img 
            src={user.photoURL || ''} 
            className="w-8 h-8 rounded-full border border-white/10" 
            alt="Avatar" 
            onClick={() => signOut(auth)}
          />
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
