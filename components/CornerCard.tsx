
import React from 'react';
import { CornerAnalysis } from '../types';

interface CornerCardProps {
  corner: CornerAnalysis;
}

export const CornerCard: React.FC<CornerCardProps> = ({ corner }) => {
  // Badge background colors
  const getBrakingColor = (zone: string) => {
    switch (zone) {
      case 'Heavy': return 'bg-f1-red text-white shadow-[0_0_10px_rgba(255,24,1,0.4)]';
      case 'Medium': return 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]';
      case 'Light': return 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.4)]';
      case 'Lift': return 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]';
      case 'Flat-out': return 'bg-f1-teal text-black shadow-[0_0_10px_rgba(0,210,190,0.4)]';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  // Color for border/text usage
  const getZoneColorClass = (zone: string) => {
    switch (zone) {
      case 'Heavy': return 'text-f1-red border-f1-red';
      case 'Medium': return 'text-orange-500 border-orange-500';
      case 'Light': return 'text-yellow-500 border-yellow-500';
      case 'Lift': return 'text-blue-500 border-blue-500';
      case 'Flat-out': return 'text-f1-teal border-f1-teal';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  // Shadow/Glow for the container (Left Bar Effect)
  const getCardGlow = (zone: string) => {
      switch (zone) {
      case 'Heavy': return 'shadow-[inset_4px_0_0_0_#FF1801] hover:shadow-[inset_6px_0_0_0_#FF1801,0_4px_20px_rgba(255,24,1,0.1)]';
      case 'Medium': return 'shadow-[inset_4px_0_0_0_#f97316] hover:shadow-[inset_6px_0_0_0_#f97316,0_4px_20px_rgba(249,115,22,0.1)]';
      case 'Light': return 'shadow-[inset_4px_0_0_0_#eab308] hover:shadow-[inset_6px_0_0_0_#eab308,0_4px_20px_rgba(234,179,8,0.1)]';
      case 'Lift': return 'shadow-[inset_4px_0_0_0_#3b82f6] hover:shadow-[inset_6px_0_0_0_#3b82f6,0_4px_20px_rgba(59,130,246,0.1)]';
      case 'Flat-out': return 'shadow-[inset_4px_0_0_0_#00D2BE] hover:shadow-[inset_6px_0_0_0_#00D2BE,0_4px_20px_rgba(0,210,190,0.1)]';
      default: return 'shadow-[inset_4px_0_0_0_#374151]';
    }
  };

  const getBrakingText = (zone: string) => {
    switch (zone) {
      case 'Heavy': return '重煞 (Heavy)';
      case 'Medium': return '中煞 (Medium)';
      case 'Light': return '輕煞 (Light)';
      case 'Lift': return '收油 (Lift)';
      case 'Flat-out': return '全油門 (Flat-out)';
      default: return zone;
    }
  };

  // Visual Telemetry Indicator (Heat Bar)
  const renderTelemetryBar = (zone: string) => {
    let percentage = 0;
    let gradient = '';
    let label = 'BRAKE PRESS.';
    
    switch (zone) {
      case 'Heavy': 
        percentage = 95; 
        gradient = 'bg-gradient-to-r from-red-900 via-f1-red to-red-400 shadow-[0_0_8px_rgba(255,24,1,0.6)]'; 
        break;
      case 'Medium': 
        percentage = 60; 
        gradient = 'bg-gradient-to-r from-orange-900 via-orange-500 to-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.6)]'; 
        break;
      case 'Light': 
        percentage = 30; 
        gradient = 'bg-gradient-to-r from-yellow-900 via-yellow-500 to-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.6)]'; 
        break;
      case 'Lift': 
        percentage = 10; 
        gradient = 'bg-gradient-to-r from-blue-900 via-blue-500 to-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.6)]'; 
        label = 'COASTING';
        break;
      case 'Flat-out': 
        percentage = 100; 
        gradient = 'bg-gradient-to-r from-teal-900 via-f1-teal to-cyan-300 shadow-[0_0_8px_rgba(0,210,190,0.6)]'; 
        label = 'THROTTLE';
        break;
    }

    return (
      <div className="w-24 mt-2">
         <div className="flex justify-between items-end mb-1">
            <span className="text-[9px] text-gray-500 font-mono tracking-tighter">{label}</span>
            <span className="text-[9px] font-mono font-bold text-gray-300">{percentage}%</span>
         </div>
         <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-white/10 relative">
             {/* Background Grid */}
             <div className="absolute inset-0 flex justify-between px-[1px] opacity-20 z-0">
                <div className="w-[1px] h-full bg-white"></div>
                <div className="w-[1px] h-full bg-white"></div>
                <div className="w-[1px] h-full bg-white"></div>
                <div className="w-[1px] h-full bg-white"></div>
             </div>
             {/* Active Bar */}
             <div 
               className={`h-full rounded-full transition-all duration-1000 relative z-10 ${gradient}`} 
               style={{ width: `${percentage}%` }}
             ></div>
         </div>
      </div>
    );
  }

  return (
    <div className={`bg-f1-carbon border border-white/5 rounded-lg p-5 transition-all duration-300 group relative overflow-hidden ${getCardGlow(corner.brakingZone)}`}>
      {/* Background Gradient Hint */}
      <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none`} />

      {/* Abstract Racing Line SVG Visualization - Dashed White Line */}
      {corner.racingLineSVG && (
        <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* The Dashed White Racing Line */}
            <path 
              d={corner.racingLineSVG} 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeDasharray="6, 6"
            />
          </svg>
        </div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-4">
          {/* Number Circle */}
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center font-display font-bold text-2xl border-2 backdrop-blur-sm transition-colors bg-black/20 ${getZoneColorClass(corner.brakingZone)}`}>
            {corner.number}
          </div>
          <div>
            {corner.name && <h4 className="text-base font-bold text-white leading-tight mb-0.5">{corner.name}</h4>}
            <span className="text-xs text-gray-400 font-mono tracking-wide">{corner.type}</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
           <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wide mb-0.5 ${getBrakingColor(corner.brakingZone)}`}>
            {getBrakingText(corner.brakingZone)}
          </span>
          {/* Visual Intensity Meter */}
          {renderTelemetryBar(corner.brakingZone)}
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-5 leading-relaxed border-l-2 border-white/10 pl-4 py-1 relative z-10">
        {corner.advice}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 bg-black/10 -mx-5 -mb-5 px-5 py-3 relative z-10">
         {/* Gear Indicator */}
         <div className="flex items-center gap-3">
            {corner.gear ? (
             <>
               <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">GEAR</span>
               <div className="w-8 h-8 rounded bg-black border border-white/20 flex items-center justify-center font-display font-bold text-lg text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                 {corner.gear}
               </div>
             </>
            ) : (
              <span className="text-[10px] text-gray-600 font-mono">--</span>
            )}
         </div>

         {/* Difficulty Bar */}
         <div className="flex items-center gap-3 flex-1 justify-end max-w-[50%]">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">難度</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-sm overflow-hidden flex shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ${corner.difficulty >= 8 ? 'bg-gradient-to-r from-orange-500 to-f1-red' : 'bg-gradient-to-r from-f1-teal to-blue-500'}`} 
                style={{ width: `${(corner.difficulty / 10) * 100}%` }}
              />
            </div>
            <span className="text-sm font-display font-bold text-white w-6 text-right">{corner.difficulty}</span>
         </div>
      </div>
    </div>
  );
};
