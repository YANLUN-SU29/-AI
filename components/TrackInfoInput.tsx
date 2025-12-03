
import React from 'react';

interface TrackInfoInputProps {
  trackName: string;
  setTrackName: (name: string) => void;
  trackLength: string;
  setTrackLength: (length: string) => void;
  disabled: boolean;
}

export const TrackInfoInput: React.FC<TrackInfoInputProps> = ({ 
  trackName, 
  setTrackName, 
  trackLength, 
  setTrackLength, 
  disabled 
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4 w-full bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
         <svg className="w-4 h-4 text-f1-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <span className="text-xs text-gray-300 uppercase tracking-wider font-bold">賽道基礎資訊 (提升精準度關鍵)</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-500 uppercase">賽道名稱 (選填)</label>
          <input
            type="text"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            disabled={disabled}
            placeholder="例如: 鈴鹿賽道, 大魯閣卡丁車場"
            className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-f1-red focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-500 uppercase">賽道總長度 (公尺/Meters) (選填)</label>
          <input
            type="number"
            value={trackLength}
            onChange={(e) => setTrackLength(e.target.value)}
            disabled={disabled}
            placeholder="例如: 5807 (鈴鹿), 1200 (卡丁車)"
            className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-f1-red focus:outline-none transition-colors"
          />
          <p className="text-[10px] text-gray-600 mt-1">
            * 輸入精確長度可大幅提升單圈時間預測準確度
          </p>
        </div>
      </div>
    </div>
  );
};
