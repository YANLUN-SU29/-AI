
import React from 'react';

interface HeaderProps {
  onOpenTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTutorial }) => {
  return (
    <header className="border-b border-white/10 bg-f1-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* New Logo: Circuit Pulse */}
          <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 overflow-hidden group">
            <svg className="w-6 h-6 text-f1-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 m-auto" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" className="opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            </svg>
            <div className="absolute top-0 right-0 w-2 h-2 bg-f1-teal rounded-full animate-pulse mr-1 mt-1"></div>
          </div>
          
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider uppercase text-white flex items-center gap-1">
              賽道遙測與策略<span className="text-f1-red">.AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 leading-none">Powered by Gemini 2.5 Engineering</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={onOpenTutorial}
             className="text-gray-400 hover:text-white text-sm transition-colors hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             教學說明
           </button>
           <div className="h-4 w-[1px] bg-white/20 hidden sm:block"></div>
           <span className="text-xs font-mono text-f1-teal animate-pulse flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-f1-teal"></span>
             系統：連線中
           </span>
        </div>
      </div>
    </header>
  );
};
