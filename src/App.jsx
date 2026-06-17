import React, { useState } from 'react';
import { Wrench, Sparkles, Terminal, Smile, Cpu, Settings } from 'lucide-react';

import EngineeringHub from './apps/EngineeringHub';
import AiHub from './apps/AiHub';
import WebAppsHub from './apps/WebAppsHub';
import FunHub from './apps/FunHub';

export default function App() {
  const [activeTab, setActiveTab] = useState('engineering');

  const navigationItems = [
    { id: 'engineering', label: 'Engineering', icon: Wrench, color: 'text-blue-500' },
    { id: 'ai', label: 'AI Tools', icon: Sparkles, color: 'text-purple-500' },
    { id: 'webapps', label: 'Web Apps', icon: Terminal, color: 'text-emerald-500' },
    { id: 'fun', label: 'Fun Projects', icon: Smile, color: 'text-amber-500' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'engineering': return <EngineeringHub />;
      case 'ai': return <AiHub />;
      case 'webapps': return <WebAppsHub />;
      case 'fun': return <FunHub />;
      default: return <EngineeringHub />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2 py-3">
            <Cpu className="h-6 w-6 text-indigo-500 animate-pulse" />
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              HubOS v1.0
            </span>
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="text-xs text-slate-500 p-2">Dev Mode Active</div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around z-50">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${isActive ? 'text-white' : 'text-slate-500'}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? item.color : 'text-slate-500'}`} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}