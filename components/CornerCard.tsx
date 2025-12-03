
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

  // Intensity Bars Visualization
  const renderIntensityBars = (zone: string) => {
    let level = 0;
    let colorClass = '';
    
    switch (zone) {
      case 'Heavy': level = 5; colorClass = 'bg-f1-red'; break;
      case 'Medium': level = 3; colorClass = 'bg-orange-500'; break;
      case 'Light': level = 2; colorClass = 'bg-yellow-500'; break;
      case 'Lift': level = 1; colorClass = 'bg-blue-500'; break;
      case 'Flat-out': level = 5; colorClass = 'bg-f1-teal'; break; // Special style for flat out?
    }
    
    // Flat-out gets a special full solid bar look or all green
    if (zone === 'Flat-out') {
       return (
         <div className="flex gap-0.5 mt-1.5 h-1.5 w-full max-w-[80px]">
           <div className="w-full h-full rounded-sm bg-f1-teal shadow-[0_0_5px_#00D2BE]"></div>
         </div>
       )
    }

    return (
      <div className="flex gap-1 mt-1.5 justify-end">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`w-2 h-1.5 rounded-sm transition-all ${i <= level ? colorClass : 'bg-gray-800'}`} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-f1-carbon border border-white/5 rounded-lg p-5 transition-all duration-300 group relative overflow-hidden ${getCardGlow(corner.brakingZone)}`}>
      {/* Background Gradient Hint */}
      <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none`} />

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
           <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wide mb-1 ${getBrakingColor(corner.brakingZone)}`}>
            {getBrakingText(corner.brakingZone)}
          </span>
          {/* Visual Intensity Meter */}
          {renderIntensityBars(corner.brakingZone)}
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-5 leading-relaxed border-l-2 border-white/10 pl-4 py-1">
        {corner.advice}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 bg-black/10 -mx-5 -mb-5 px-5 py-3">
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
