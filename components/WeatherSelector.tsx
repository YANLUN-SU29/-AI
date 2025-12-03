
import React from 'react';
import { WeatherCondition } from '../types';

interface WeatherSelectorProps {
  weather: WeatherCondition;
  setWeather: (w: WeatherCondition) => void;
  disabled: boolean;
}

export const WeatherSelector: React.FC<WeatherSelectorProps> = ({ weather, setWeather, disabled }) => {
  return (
    <div className="flex flex-col gap-2 mb-4 w-full">
      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">賽道天氣狀況 (Weather Condition)</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setWeather('Dry')}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-bold transition-all duration-200 ${
            weather === 'Dry' 
              ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          晴天 / 乾地
        </button>
        <button
          onClick={() => setWeather('Wet')}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-bold transition-all duration-200 ${
            weather === 'Wet' 
              ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.15)]' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19a2 2 0 002 2 2 2 0 002-2" />
          </svg>
          雨天 / 濕地
        </button>
      </div>
    </div>
  );
};
