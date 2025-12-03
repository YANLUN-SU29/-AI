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

  // Card border and glow effects
  const getCardStyle = (zone: string) => {
    switch (zone) {
      case 'Heavy': 
        return 'border-l-f1-red shadow-[inset_10px_0_20px_-10px_rgba(255,24,1,0.15)]';
      case 'Medium': 
        return 'border-l-orange-500 shadow-[inset_10px_0_20px_-10px_rgba(249,115,22,0.15)]';
      case 'Light': 
        return 'border-l-yellow-500 shadow-[inset_10px_0_20px_-10px_rgba(234,179,8,0.15)]';
      case 'Lift': 
        return 'border-l-blue-500 shadow-[inset_10px_0_20px_-10px_rgba(59,130,246,0.15)]';
      case 'Flat-out': 
        return 'border-l-f1-teal shadow-[inset_10px_0_20px_-10px_rgba(0,210,190,0.15)]';
      default: 
        return 'border-l-gray-700';
    }
  };

  // Number circle style matches braking zone
  const getNumberStyle = (zone: string) => {
    switch (zone) {
      case 'Heavy': return 'bg-f1-red/10 text-f1-red border-f1-red/30';
      case 'Medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'Light': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'Lift': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'Flat-out': return 'bg-f1-teal/10 text-f1-teal border-f1-teal/30';
      default: return 'bg-white/10 text-white border-white/10';
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

  return (
    <div className={`bg-f1-carbon border-y border-r border-white/5 border-l-[6px] rounded-r-lg rounded-l-sm p-4 hover:translate-x-1 transition-all duration-300 group relative overflow-hidden ${getCardStyle(corner.brakingZone)}`}>
      {/* Visual background gradient hint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none" />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Enhanced Number Circle with Color Tint */}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-display font-bold text-xl border backdrop-blur-sm transition-colors ${getNumberStyle(corner.brakingZone)}`}>
            {corner.number}
          </div>
          <div>
            {corner.name && <h4 className="text-sm font-semibold text-white leading-tight">{corner.name}</h4>}
            <span className="text-xs text-gray-400">{corner.type}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
           <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wide ${getBrakingColor(corner.brakingZone)}`}>
            {getBrakingText(corner.brakingZone)}
          </span>
          {corner.gear && (
             <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
               <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
               檔位: <span className="text-white font-bold">{corner.gear}</span>
             </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-4 leading-relaxed border-l-2 border-white/10 pl-3 py-1">
        {corner.advice}
      </p>

      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">駕駛難度</span>
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
          <div 
            className={`h-full transition-all duration-1000 ${corner.difficulty >= 8 ? 'bg-gradient-to-r from-orange-500 to-f1-red' : 'bg-gradient-to-r from-f1-teal to-blue-500'}`} 
            style={{ width: `${(corner.difficulty / 10) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-white">{corner.difficulty}/10</span>
      </div>
    </div>
  );
};
