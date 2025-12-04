
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

  // stats.sectorX is now an object { time, description }
  const s1 = parseTime(stats.sector1.time);
  const s2 = parseTime(stats.sector2.time);
  const s3 = parseTime(stats.sector3.time);
  const total = s1 + s2 + s3 || 1; // avoid division by zero
  
  const getPercent = (val: number) => Math.round((val / total) * 100);

  return (
    <div className="bg-f1-dark border border-white/10 rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-f1-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                遙測數據預估 (Telemetry Estimation)
            </h3>
            <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                以下數據基於賽道幾何物理模型與車輛性能參數（抓地力係數、馬力重量比）進行模擬運算。
                <span className="hidden sm:inline"> 單圈時間已考量理想賽車路線 (Geometric Racing Line) 與輪胎最佳工作溫度窗口。</span>
            </p>
        </div>
        <div className="text-right hidden md:block">
            <span className="text-[10px] text-f1-teal font-mono bg-f1-teal/10 px-2 py-1 rounded border border-f1-teal/20">
                SIMULATION: HIGH GRIP
            </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sector 1 */}
        <div className="relative p-4 bg-f1-carbon rounded border border-l-4 border-f1-red/50 md:border-l-0 md:border-t-4 border-white/5 overflow-hidden group hover:bg-white/5 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-f1-red opacity-30 group-hover:opacity-100 transition-all"></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold flex justify-between mb-1">
              Sector 1 <span className="text-f1-red">{getPercent(s1)}%</span>
          </span>
          <p className="font-display text-2xl text-white font-bold mb-2">{stats.sector1.time}</p>
          <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-2">
            {stats.sector1.description}
          </p>
        </div>

        {/* Sector 2 */}
        <div className="relative p-4 bg-f1-carbon rounded border border-l-4 border-blue-500/50 md:border-l-0 md:border-t-4 border-white/5 overflow-hidden group hover:bg-white/5 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-30 group-hover:opacity-100 transition-all"></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold flex justify-between mb-1">
              Sector 2 <span className="text-blue-400">{getPercent(s2)}%</span>
          </span>
          <p className="font-display text-2xl text-white font-bold mb-2">{stats.sector2.time}</p>
          <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-2">
            {stats.sector2.description}
          </p>
        </div>

        {/* Sector 3 */}
        <div className="relative p-4 bg-f1-carbon rounded border border-l-4 border-yellow-500/50 md:border-l-0 md:border-t-4 border-white/5 overflow-hidden group hover:bg-white/5 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 opacity-30 group-hover:opacity-100 transition-all"></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold flex justify-between mb-1">
              Sector 3 <span className="text-yellow-500">{getPercent(s3)}%</span>
          </span>
          <p className="font-display text-2xl text-white font-bold mb-2">{stats.sector3.time}</p>
          <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-2">
            {stats.sector3.description}
          </p>
        </div>

        {/* Total Lap */}
        <div className="p-4 bg-gradient-to-br from-f1-carbon to-black rounded border border-t-4 border-f1-teal/50 border-white/5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 bg-f1-teal/10 blur-2xl rounded-full pointer-events-none"></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Theoretical Lap Time</span>
          <p className="font-display text-3xl text-f1-teal font-bold tracking-tight">{stats.estimatedLapTime}</p>
          <div className="mt-2 text-[9px] text-gray-600 font-mono">
            * 考量燃油負載與輪胎狀態
          </div>
        </div>
      </div>
      
      {/* Visual Bar representation of lap splits */}
      <div className="mt-6">
         <div className="flex justify-between text-[10px] text-gray-400 uppercase font-mono mb-1">
            <span>Lap Split Visualization</span>
            <span>100%</span>
         </div>
         <div className="h-3 bg-gray-800 rounded-full flex overflow-hidden border border-white/5">
            <div className="h-full bg-f1-red hover:bg-red-500 transition-colors duration-300 relative group cursor-help" style={{width: `${getPercent(s1)}%`}}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black transition-opacity">S1</div>
            </div>
            <div className="h-full bg-blue-500 hover:bg-blue-400 transition-colors duration-300 relative group cursor-help" style={{width: `${getPercent(s2)}%`}}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black transition-opacity">S2</div>
            </div>
            <div className="h-full bg-yellow-500 hover:bg-yellow-400 transition-colors duration-300 relative group cursor-help" style={{width: `${getPercent(s3)}%`}}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black transition-opacity">S3</div>
            </div>
         </div>
      </div>
    </div>
  );
};
