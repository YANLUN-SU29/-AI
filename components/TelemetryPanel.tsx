
import React from 'react';
import { SectorStats } from '../types';

interface TelemetryPanelProps {
  stats?: SectorStats;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-f1-dark border border-white/10 rounded-lg p-4 mb-6">
      <h3 className="font-display text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-f1-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        遙測數據預估 (Telemetry)
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sector 1 */}
        <div className="relative p-3 bg-f1-carbon rounded border border-l-4 border-f1-red/50 md:border-l-0 md:border-b-4 border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Sector 1</span>
          <p className="font-mono text-xl text-white font-bold">{stats.sector1}</p>
        </div>

        {/* Sector 2 */}
        <div className="relative p-3 bg-f1-carbon rounded border border-l-4 border-blue-500/50 md:border-l-0 md:border-b-4 border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Sector 2</span>
          <p className="font-mono text-xl text-white font-bold">{stats.sector2}</p>
        </div>

        {/* Sector 3 */}
        <div className="relative p-3 bg-f1-carbon rounded border border-l-4 border-yellow-500/50 md:border-l-0 md:border-b-4 border-white/5">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Sector 3</span>
          <p className="font-mono text-xl text-white font-bold">{stats.sector3}</p>
        </div>

        {/* Total Lap */}
        <div className="relative p-3 bg-white/5 rounded border border-f1-teal/20">
          <span className="text-[10px] text-f1-teal uppercase font-bold">Est. Lap Time</span>
          <p className="font-mono text-xl text-f1-teal font-bold">{stats.estimatedLapTime}</p>
        </div>
      </div>
    </div>
  );
};
