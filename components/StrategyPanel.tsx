
import React, { useState } from 'react';
import { TrackAnalysis, WeatherCondition, VehicleType } from '../types';

interface StrategyPanelProps {
  strategy: TrackAnalysis['strategy'];
  overallCharacter: string;
  weather: WeatherCondition;
  vehicle?: VehicleType;
}

export const StrategyPanel: React.FC<StrategyPanelProps> = ({ strategy, overallCharacter, weather, vehicle }) => {
  
  // Aero Sim State
  const [showAeroSim, setShowAeroSim] = useState(false);
  const [frontWing, setFrontWing] = useState(28); // Default degrees
  const [rearWing, setRearWing] = useState(32);   // Default degrees

  // Helper to determine gradient color based on trend
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Stiff':
      case 'High':
        return 'bg-gradient-to-r from-orange-600 via-f1-red to-red-600 shadow-[0_0_12px_rgba(255,24,1,0.6)]';
      case 'Medium':
      case 'Balanced':
        return 'bg-gradient-to-r from-teal-700 via-f1-teal to-cyan-400 shadow-[0_0_12px_rgba(0,210,190,0.6)]';
      case 'Soft':
      case 'Low':
        return 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-300 shadow-[0_0_12px_rgba(234,179,8,0.6)]';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendWidth = (trend: string) => {
    switch (trend) {
      case 'Stiff':
      case 'High': return '95%';
      case 'Medium':
      case 'Balanced': return '50%'; // Perfectly centered
      case 'Soft':
      case 'Low': return '25%';
      default: return '50%';
    }
  };

  // Helper for Formula E Regen parsing
  const getRegenPercentage = (text?: string): number => {
      if (!text) return 40; // Default fallback for FE
      const match = text.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 40;
  };

  // Helper to estimate Tire Wear Level from text description
  const getTireWearLevel = (text: string) => {
    if (!text) return 'Medium';
    const lower = text.toLowerCase();
    // Prioritize high/severe detection
    if (lower.match(/(high|severe|critical|extreme|heavy|abusive|高|嚴重|劇烈|大)/)) return 'High';
    if (lower.match(/(low|light|minimal|little|good|kind|低|輕微|小)/)) return 'Low';
    return 'Medium';
  };

  // Aero Simulation Logic
  const calculateAeroStats = () => {
      const totalWing = frontWing + rearWing;
      // Heuristic calculations
      // Downforce increases with angle
      const downforce = Math.min(100, Math.round((totalWing / 100) * 100)); 
      // Drag increases faster with angle
      const drag = Math.min(100, Math.round((totalWing / 100) * 110)); 
      // Top Speed decreases as drag increases (Base ~340kph - drag factor)
      const topSpeed = Math.round(345 - (drag * 0.6));
      
      // Balance Logic
      const diff = frontWing - rearWing;
      let balance = "Balanced (Neutral)";
      let balanceColor = "text-f1-teal";
      
      if (diff > 4) {
          balance = "Oversteer (Pointy)";
          balanceColor = "text-orange-500";
      } else if (diff < -4) {
          balance = "Understeer (Stable)";
          balanceColor = "text-blue-400";
      }

      return { downforce, drag, topSpeed, balance, balanceColor };
  };

  const aeroStats = calculateAeroStats();

  const renderTireWearVisual = (text: string) => {
    const level = getTireWearLevel(text);
    let activeIndex = 1; 
    if (level === 'Low') activeIndex = 0;
    if (level === 'High') activeIndex = 2;

    return (
      <div className="mt-auto pt-3 w-full border-t border-white/5">
         <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1 uppercase">
            <span>Degradation Level</span>
            <span className={`font-bold ${
                level === 'High' ? 'text-f1-red' : 
                level === 'Low' ? 'text-f1-teal' : 'text-yellow-500'
            }`}>{level}</span>
         </div>
         <div className="flex gap-1 h-2">
            {/* Low Segment */}
            <div className={`flex-1 rounded-sm transition-colors duration-500 ${activeIndex >= 0 ? 'bg-f1-teal shadow-[0_0_5px_rgba(0,210,190,0.5)]' : 'bg-gray-800'}`}></div>
            {/* Medium Segment */}
            <div className={`flex-1 rounded-sm transition-colors duration-500 ${activeIndex >= 1 ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'bg-gray-800'}`}></div>
            {/* High Segment */}
            <div className={`flex-1 rounded-sm transition-colors duration-500 ${activeIndex >= 2 ? 'bg-f1-red shadow-[0_0_5px_rgba(255,24,1,0.5)]' : 'bg-gray-800'}`}></div>
         </div>
         <div className="flex justify-between text-[9px] font-mono text-gray-600 uppercase tracking-wider mt-1">
             <span className={activeIndex >= 0 ? 'text-gray-400' : ''}>Light</span>
             <span className={activeIndex >= 1 ? 'text-gray-400' : ''}>Med</span>
             <span className={activeIndex >= 2 ? 'text-gray-400' : ''}>High</span>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-f1-carbon to-gray-900 rounded-xl border border-white/10 p-6 relative overflow-hidden">
      {/* Weather Indicator Background Effect */}
      {weather === 'Wet' && (
        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
      )}
      {weather === 'Dry' && (
        <div className="absolute top-0 right-0 p-32 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-f1-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          賽事策略與調校建議
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Vehicle Badge */}
          {vehicle && (
            <div className="px-3 py-1 rounded-full text-xs font-bold border border-white/20 bg-white/5 text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
               {vehicle}
            </div>
          )}

          {/* Weather Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            weather === 'Wet' 
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
              : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
          }`}>
            {weather === 'Wet' ? (
               <>
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                 </svg>
                 WET
               </>
            ) : (
               <>
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
                 DRY
               </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-1">賽道特性</h4>
        <p className="text-white italic">"{overallCharacter}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Tire Wear & Key to Win (Stacked) */}
        <div className="flex flex-col gap-4 h-full">
          {/* Tire Wear */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2 text-f1-red">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-xs uppercase">輪胎磨損 (Tire Wear)</span>
            </div>
            <p className="text-sm text-gray-300">{strategy.tireWear}</p>
            {renderTireWearVisual(strategy.tireWear)}
          </div>

          {/* Key to Win (New) */}
          <div className="bg-gradient-to-br from-f1-teal/10 to-transparent p-4 rounded-lg border border-f1-teal/20 flex flex-col flex-1 shadow-[inset_0_0_20px_rgba(0,210,190,0.05)]">
            <div className="flex items-center gap-2 mb-2 text-f1-teal">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
               </svg>
               <span className="font-bold text-xs uppercase">獲勝關鍵 (Key to Win)</span>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed italic">
               "{strategy.keyToWin || "分析中..."}"
            </p>
          </div>
        </div>

        {/* Column 2: Setup Suggestion - Enhanced Visuals */}
        <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col h-full col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-3 text-f1-teal">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-bold text-xs uppercase">調校參數可視化</span>
          </div>
          
          {/* Detailed Visual Bars */}
          {strategy.detailedSetup && strategy.detailedSetup.length > 0 ? (
            <div className="flex flex-col gap-3 mt-1">
              {strategy.detailedSetup.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-gray-400 font-medium group-hover:text-white transition-colors">
                      {item.component}
                    </span>
                    <span className="text-xs font-mono font-bold text-f1-teal">
                      {item.value} <span className="text-[9px] text-gray-500 ml-0.5">{item.unit}</span>
                    </span>
                  </div>
                  
                  {/* Visual Bar Container */}
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex items-center relative border border-white/5">
                    {/* Baseline Marker (Center) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l border-dashed border-white/30 z-10 transform -translate-x-1/2 opacity-50"></div>
                    
                    {/* Background Grid Ticks */}
                    <div className="absolute inset-0 flex justify-between px-0.5 z-0">
                       <div className="w-[1px] h-full bg-white/5"></div>
                       <div className="w-[1px] h-full bg-white/5"></div>
                       <div className="w-[1px] h-full bg-white/5"></div>
                       <div className="w-[1px] h-full bg-white/5"></div>
                       <div className="w-[1px] h-full bg-white/5"></div>
                    </div>

                    {/* Active Bar */}
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative z-0 ${getTrendColor(item.trend)}`} 
                      style={{ width: getTrendWidth(item.trend) }}
                    ></div>
                  </div>
                  
                  {/* Scale Labels */}
                  <div className="flex justify-between text-[8px] text-gray-600 mt-1 uppercase tracking-wide font-mono">
                     <span className={item.trend === 'Soft' || item.trend === 'Low' ? 'text-yellow-500 font-bold' : ''}>Soft/Low</span>
                     <span className={item.trend === 'Balanced' || item.trend === 'Medium' ? 'text-f1-teal font-bold' : ''}>Balanced</span>
                     <span className={item.trend === 'Stiff' || item.trend === 'High' ? 'text-f1-red font-bold' : ''}>Stiff/High</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-sm text-gray-300">{strategy.setupSuggestion}</p>
          )}
        </div>

        {/* Column 3: Strategy Column: Overtaking, Aero, Pit/Regen */}
        <div className="flex flex-col gap-4 col-span-1">
            {/* Overtaking */}
            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-yellow-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-xs uppercase">超車熱點 (Overtaking)</span>
                </div>
                <p className="text-sm text-gray-300">{strategy.overtakingOpportunities}</p>
            </div>

            {/* Aerodynamics Strategy with Interactive Sim */}
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex-1 flex flex-col transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        <span className="font-bold text-xs uppercase">空力調校策略 (Aerodynamics)</span>
                    </div>
                    {/* Toggle Sim Button */}
                    <button 
                        onClick={() => setShowAeroSim(!showAeroSim)}
                        className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${showAeroSim ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-700 hover:border-blue-400 hover:text-blue-400'}`}
                    >
                        {showAeroSim ? '收起模擬' : '開啟模擬器'}
                    </button>
                </div>

                {!showAeroSim ? (
                   <p className="text-sm text-gray-300 leading-relaxed">
                       {strategy.aeroStrategy || "分析中..."}
                   </p>
                ) : (
                   <div className="mt-2 animate-fade-in space-y-4">
                       {/* Sliders */}
                       <div className="space-y-3 p-3 bg-black/30 rounded border border-white/5">
                           <div className="space-y-1">
                               <div className="flex justify-between text-[10px] text-gray-400">
                                   <span>Front Wing Angle</span>
                                   <span className="text-white font-mono">{frontWing}°</span>
                               </div>
                               <input 
                                  type="range" min="15" max="50" value={frontWing} 
                                  onChange={(e) => setFrontWing(parseInt(e.target.value))}
                                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                           </div>
                           <div className="space-y-1">
                               <div className="flex justify-between text-[10px] text-gray-400">
                                   <span>Rear Wing Angle</span>
                                   <span className="text-white font-mono">{rearWing}°</span>
                               </div>
                               <input 
                                  type="range" min="10" max="45" value={rearWing} 
                                  onChange={(e) => setRearWing(parseInt(e.target.value))}
                                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                           </div>
                       </div>

                       {/* Output Graphs */}
                       <div className="space-y-2">
                            {/* Downforce */}
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 w-16 text-right uppercase">Downforce</span>
                                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-f1-teal transition-all duration-300"
                                      style={{ width: `${aeroStats.downforce}%` }}
                                    ></div>
                                </div>
                            </div>
                            {/* Drag */}
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 w-16 text-right uppercase">Drag</span>
                                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-f1-red transition-all duration-300"
                                      style={{ width: `${aeroStats.drag}%` }}
                                    ></div>
                                </div>
                            </div>
                            {/* Stats */}
                            <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-500 uppercase">Est. Top Speed</span>
                                    <span className="text-sm font-mono text-white font-bold">{aeroStats.topSpeed} km/h</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-gray-500 uppercase">Balance</span>
                                    <span className={`text-[10px] font-bold ${aeroStats.balanceColor}`}>{aeroStats.balance}</span>
                                </div>
                            </div>
                       </div>
                   </div>
                )}
            </div>

            {/* CONDITIONAL: Regen (FE) OR Pit Stop (Others) */}
            {vehicle === 'FormulaE' ? (
                <div className="bg-gradient-to-br from-black/40 to-blue-900/10 p-4 rounded-lg border border-f1-teal/30 flex-1 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-f1-teal/5 animate-pulse pointer-events-none"></div>
                   
                   <div className="flex items-center gap-2 mb-2 text-f1-teal">
                        <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-bold text-xs uppercase tracking-wider">電能回收效率 (Regen)</span>
                   </div>
                   
                   <p className="text-sm text-gray-300 leading-relaxed mb-3 relative z-10">
                        {strategy.regenOps || strategy.pitStrategy}
                   </p>

                   {/* Visual Battery Bar */}
                   <div className="relative pt-2 z-10">
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
                            <span>REGEN PER LAP</span>
                            <span className="text-f1-teal font-bold">{getRegenPercentage(strategy.regenOps)}%</span>
                        </div>
                        <div className="h-4 bg-gray-900 rounded border border-gray-700 overflow-hidden relative">
                             {/* Battery Segments */}
                             <div className="absolute inset-0 flex">
                                  {Array.from({length: 10}).map((_, i) => (
                                     <div key={i} className="flex-1 border-r border-black/50 last:border-0"></div>
                                  ))}
                             </div>
                             {/* Fill */}
                             <div 
                                className="h-full bg-gradient-to-r from-teal-800 to-f1-teal shadow-[0_0_10px_rgba(0,210,190,0.5)] transition-all duration-1000"
                                style={{ width: `${getRegenPercentage(strategy.regenOps)}%` }}
                             >
                                 <div className="w-full h-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
                             </div>
                        </div>
                   </div>
                </div>
            ) : (
                <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex-1">
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="font-bold text-xs uppercase">進站策略 (Pit Strategy)</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {strategy.pitStrategy || "分析中..."}
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
