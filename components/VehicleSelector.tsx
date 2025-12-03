
import React from 'react';
import { VehicleType } from '../types';

interface VehicleSelectorProps {
  vehicle: VehicleType;
  setVehicle: (v: VehicleType) => void;
  disabled: boolean;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ vehicle, setVehicle, disabled }) => {
  const vehicles: { type: VehicleType; label: string; icon: React.ReactNode }[] = [
    { 
      type: 'F1', 
      label: 'Formula 1', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    { 
      type: 'FormulaE', 
      label: 'Formula E', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      type: 'GT3', 
      label: 'GT3 / 房車賽', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l2-2h10l2 2m0 6v-6m-14 6v-6m0 6h14m-14 0l-1 2h16l-1-2M7 16a2 2 0 110 4 2 2 0 010-4zm10 0a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      )
    },
    { 
      type: 'Karting', 
      label: '卡丁車', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3v-1m-18 0v1a3 3 0 003 3m0-5V9a2 2 0 012-2h6a2 2 0 012 2v5m-9 0h9" />
        </svg>
      )
    },
    {
        type: 'RoadCar',
        label: '一般跑車',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        )
    }
  ];

  return (
    <div className="flex flex-col gap-2 mb-4 w-full">
      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">選擇車輛種類 (Vehicle Class)</label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {vehicles.map((v) => (
          <button
            key={v.type}
            onClick={() => setVehicle(v.type)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-lg border text-sm font-bold transition-all duration-200 ${
              vehicle === v.type 
                ? 'bg-f1-red/20 border-f1-red text-white shadow-[0_0_15px_rgba(255,24,1,0.2)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {v.icon}
            <span className="text-xs whitespace-nowrap">{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
