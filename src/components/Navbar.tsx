import React from 'react';
import { Plus, FileSpreadsheet, CheckSquare } from 'lucide-react';

interface NavbarProps {
  activeTab: 'comparison' | 'shipments' | 'framework' | 'history' | 'ratecards' | 'forwarders';
  setActiveTab: (tab: 'comparison' | 'shipments' | 'framework' | 'history' | 'ratecards' | 'forwarders') => void;
  onOpenNewQuote: () => void;
  onOpenSheetsSync: () => void;
  onOpenAudit: () => void;
  syncStatus: 'idle' | 'syncing' | 'connected' | 'error';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewQuote,
  onOpenSheetsSync,
  onOpenAudit,
  syncStatus,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Clean Brand Icon Logo */}
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('comparison')}
            title="Hungry Artisan Logistics"
            className="group flex items-center justify-center p-1 rounded-lg hover:bg-neutral-900 cursor-pointer focus-visible:outline-none transition-colors"
          >
            <img
              src="/favicon.svg"
              alt="Hungry Artisan"
              referrerPolicy="no-referrer"
              className="w-8 h-8 shrink-0 rounded-lg border border-neutral-800/80 shadow-xs group-hover:border-amber-500/60 transition-colors"
            />
          </button>
        </div>

        {/* Zone 2: Navigation Links (Text with subtle active indicator) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Quote Scenarios
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'shipments'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Shipments
          </button>
          <button
            onClick={() => setActiveTab('framework')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'framework'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Global Supply Chain & Team
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Historical & Variance
          </button>
          <button
            onClick={() => setActiveTab('ratecards')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ratecards'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Rate Cards
          </button>
          <button
            onClick={() => setActiveTab('forwarders')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'forwarders'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Forwarders
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          {/* Sheets Operational DB Status Indicator */}
          <button
            onClick={onOpenSheetsSync}
            title="Google Sheets Operational Store Integration"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Sheets DB</span>
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'connected'
                  ? 'bg-emerald-500'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-neutral-500'
              }`}
            />
          </button>

          {/* 10 Success Criteria Audit */}
          <button
            onClick={onOpenAudit}
            title="Audit against Wesley's 10 Success Criteria"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Success Criteria</span>
          </button>

          {/* Add Quote action */}
          <button
            onClick={onOpenNewQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Quote</span>
          </button>
        </div>
      </div>
    </header>
  );
};
