
import React from 'react';
import { TrackAnalysis, WeatherCondition, VehicleType } from '../types';

interface StrategyPanelProps {
  strategy: TrackAnalysis['strategy'];
  overallCharacter: string;
  weather: WeatherCondition;
  vehicle?: VehicleType;
}

export const StrategyPanel: React.FC<StrategyPanelProps> = ({ strategy, overallCharacter, weather, vehicle }) => {
  
  // Helper to get vehicle-specific setup context
  const getVehicleSetupContext = (v?: VehicleType) => {
    switch (v) {
      case 'F1':
        return {
          label: 'F1 工程重點',
          tips: ['前翼角度 (Front Wing)', '底板高度 (Ride Height)', 'ERS 部署模式', '輪胎傾角 (Camber)']
        };
      case 'FormulaE':
        return {
          label: 'FE 電控重點',
          tips: ['動能回收 (Regen)', '能量管理 (Lift & Coast)', 'Attack Mode 策略', '後輪抓地力']
        };
      case 'GT3':
        return {
          label: 'GT3 調校重點',
          tips: ['ABS 介入等級', 'TC 循跡控制', '後尾翼 (Rear Wing)', '懸吊阻尼']
        };
      case 'Karting':
        return {
          label: '卡丁車設定',
          tips: ['前後輪距 (Track Width)', '化油器混油比', '齒盤齒比 (Sprocket)', '胎壓']
        };
      case 'RoadCar':
        return {
          label: '街車賽道化',
          tips: ['胎壓管理 (熱胎壓)', '煞車散熱導風', '路線保守度', '車身動態控制']
        };
      default:
        return {
          label: '通用調校',
          tips: ['煞車平衡', '懸吊軟硬', '輪胎管理']
        };
    }
  };

  const setupContext = getVehicleSetupContext(vehicle);

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
        {/* Tire Wear */}
        <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 text-f1-red">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold text-xs uppercase">輪胎磨損</span>
          </div>
          <p className="text-sm text-gray-300">{strategy.tireWear}</p>
        </div>

        {/* Setup Suggestion - Enhanced with Vehicle Specifics */}
        <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 text-f1-teal">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-bold text-xs uppercase">調校重點</span>
          </div>
          <p className="text-sm text-gray-300 mb-3 flex-grow">{strategy.setupSuggestion}</p>
          
          {/* Dynamic Vehicle Specific Hints */}
          {vehicle && (
            <div className="mt-auto pt-3 border-t border-white/5">
               <span className="text-[10px] text-f1-teal/80 font-bold uppercase mb-2 block">{setupContext.label}</span>
               <div className="flex flex-wrap gap-1.5">
                 {setupContext.tips.map((tip, idx) => (
                   <span key={idx} className="text-[10px] bg-f1-teal/10 text-f1-teal px-1.5 py-0.5 rounded border border-f1-teal/20 whitespace-nowrap">
                     {tip}
                   </span>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Overtaking */}
        <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2 text-yellow-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold text-xs uppercase">超車熱點</span>
          </div>
          <p className="text-sm text-gray-300">{strategy.overtakingOpportunities}</p>
        </div>
      </div>
    </div>
  );
};
