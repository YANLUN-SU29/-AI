

import React from 'react';
import { SectorStats } from '../types';

interface TelemetryPanelProps {
  stats?: SectorStats;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ stats }) => {
  if (!stats) return null;

  // Simple helper to try and parse "30.5s" or "30.5" to float for visual bar calc
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const s1 = parseTime(stats.sector1);
  const s2 = parseTime(stats.sector2);
  const s3 = parseTime(stats.sector3);
  const total = s1 + s2 + s3 || 1; // avoid division by zero
  
  const getPercent = (val: number) => Math.round((val / total) * 100);

  return (
    <div className="bg-f1-dark border border-white/10 rounded-lg p-4 mb-6">
      <h3 className="font-display text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-f1-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        遙測數據預估 (Telemetry Estimation)
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sector 1 */}
        <div className="relative p-3 bg-f1-carbon rounded border border-l-4 border-f1-red/50 md:border-l-0 md:border-b-4 border-white/5 overflow-hidden group">
          <div className="absolute bottom-0 left-0 h-1 bg-f1-red opacity-30 group-hover:opacity-60 transition-all" style={{width: `${getPercent(s1)}%`}}></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold flex justify-between">
              Sector 1 <span className="text-gray-600">{getPercent(s1)}%</span>
          </span>
          <p className="font-mono text-xl text-white font-bold">{stats.sector1}</p>
        </div>

        {/* Sector 2 */}
        <div className="relative p-3 bg-f1-carbon rounded border border-l-4 border-blue-500/50 md:border-l-0 md:border-b-4 border-white/5 overflow-hidden group">
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 opacity-30 group-hover:opacity-60 transition-all" style={{width: `${getPercent(s2)}%`}}></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold flex justify-between">
              Sector 2 <span className="text-gray-600">{getPercent(s2)}%</span>
          </span>
          <p className="font-mono text-xl text-white font-bold">{stats.sector2}</p>
        </div>

        {/* Sector 3 */}
        <div className="relative p-3 bg-f1-carbon rounded border border-l-4 border-yellow-500/50 md:border-l-0 md:border-b-4 border-white/5 overflow-hidden group">
          <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 opacity-30 group-hover:opacity-60 transition-all" style={{width: `${getPercent(s3)}%`}}></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold flex justify-between">
              Sector 3 <span className="text-gray-600">{getPercent(s3)}%</span>
          </span>
          <p className="font-mono text-xl text-white font-bold">{stats.sector3}</p>
        </div>

        {/* Total Lap */}
        <div className="p-3 bg-f1-carbon rounded border border-l-4 border-f1-teal/50 md:border-l-0 md:border-b-4 border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Total Lap Time</span>
          <p className="font-mono text-xl text-f1-teal font-bold">{stats.estimatedLapTime}</p>
        </div>
      </div>
      
      {/* Visual Bar representation of lap splits */}
      <div className="mt-4 h-2 bg-gray-800 rounded-full flex overflow-hidden">
         <div className="h-full bg-f1-red transition-all duration-1000" style={{width: `${getPercent(s1)}%`}} title="Sector 1"></div>
         <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${getPercent(s2)}%`}} title="Sector 2"></div>
         <div className="h-full bg-yellow-500 transition-all duration-1000" style={{width: `${getPercent(s3)}%`}} title="Sector 3"></div>
      </div>
      <div className="flex justify-between text-[8px] text-gray-500 mt-1 uppercase font-mono">
         <span>S1</span>
         <span>S2</span>
         <span>S3</span>
      </div>
    </div>
  );
};