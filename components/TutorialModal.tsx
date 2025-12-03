
import React from 'react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const zones = [
    {
      type: 'Heavy',
      title: '重煞 (Heavy Braking)',
      color: 'bg-f1-red',
      borderColor: 'border-f1-red',
      brakeLevel: 100,
      throttleLevel: 0,
      desc: '煞車踏板踩死 (100% pressure)。通常用於長直線接髮夾彎 (Hairpin) 或 90 度低速彎。需配合降檔與 Trail Braking。',
      example: 'Monza T1, Hairpins'
    },
    {
      type: 'Medium',
      title: '中煞 (Medium Braking)',
      color: 'bg-orange-500',
      borderColor: 'border-orange-500',
      brakeLevel: 60,
      throttleLevel: 0,
      desc: '煞車約 50-70%。用於中速彎或減速彎 (Chicane)。重點是控制重心轉移至前輪，幫助車頭入彎。',
      example: 'Suzuka Degner, Spa Les Combes'
    },
    {
      type: 'Light',
      title: '輕煞 (Light Braking)',
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-500',
      brakeLevel: 30,
      throttleLevel: 0,
      desc: '輕點煞車 (Tap/Brush)。目的不是大幅減速，而是為了微調車身姿態 (修正轉向不足) 或為了進彎前的重心配置。',
      example: 'Silverstone Copse (GT3), Spa Pouhon'
    },
    {
      type: 'Lift',
      title: '收油 (Lift / Coast)',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      brakeLevel: 0,
      throttleLevel: 0,
      desc: '完全放開油門，但不踩煞車。利用空氣阻力與引擎煞車減速。常見於 Formula E (回充) 或連續彎道的節奏調整。',
      example: 'Formula E Entry, Flowing Esses'
    },
    {
      type: 'Flat-out',
      title: '全油門 (Flat-out)',
      color: 'bg-f1-teal',
      borderColor: 'border-f1-teal',
      brakeLevel: 0,
      throttleLevel: 100,
      desc: '油門焊死 (100%)。不需減速，依靠空力下壓力直接通過。這考驗車輛設定與車手膽識。',
      example: 'Eau Rouge, 130R'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-f1-dark border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-f1-dark/95 border-b border-white/10 p-6 flex justify-between items-center backdrop-blur">
          <div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
              煞車區段教學 <span className="text-f1-teal">TUTORIAL</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">了解不同煞車強度與踏板操作技巧</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div 
              key={zone.type} 
              className={`bg-black/40 border-l-4 ${zone.borderColor} rounded-r-lg p-5 flex flex-col gap-4 hover:bg-white/5 transition-colors group`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold px-2 py-1 rounded text-white ${zone.color} shadow-lg`}>
                  {zone.type.toUpperCase()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{zone.title}</h3>

              {/* Pedals Visualization */}
              <div className="bg-black/50 rounded p-3 border border-white/5 space-y-3">
                 {/* Brake Bar */}
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-mono text-gray-400 w-12 text-right">BRAKE</span>
                   <div className="flex-1 h-3 bg-gray-800 rounded-sm overflow-hidden relative">
                     <div 
                        className="h-full bg-f1-red transition-all duration-500"
                        style={{ width: `${zone.brakeLevel}%` }}
                     ></div>
                     {/* Tick marks */}
                     <div className="absolute inset-0 flex justify-between px-[1px]">
                        <div className="w-[1px] h-full bg-black/20"></div>
                        <div className="w-[1px] h-full bg-black/20"></div>
                        <div className="w-[1px] h-full bg-black/20"></div>
                     </div>
                   </div>
                   <span className="text-[10px] font-mono text-f1-red w-8 text-right">{zone.brakeLevel}%</span>
                 </div>

                 {/* Throttle Bar */}
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-mono text-gray-400 w-12 text-right">THROTTLE</span>
                   <div className="flex-1 h-3 bg-gray-800 rounded-sm overflow-hidden relative">
                     <div 
                        className="h-full bg-f1-teal transition-all duration-500"
                        style={{ width: `${zone.throttleLevel}%` }}
                     ></div>
                   </div>
                   <span className="text-[10px] font-mono text-f1-teal w-8 text-right">{zone.throttleLevel}%</span>
                 </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed min-h-[60px]">
                {zone.desc}
              </p>

              <div className="mt-auto pt-3 border-t border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Example:</span>
                <span className="text-xs text-gray-300 ml-2 font-mono">{zone.example}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            * 實際煞車力度會因車型 (F1 vs GT3) 與天氣狀況而有所不同。F1 依賴空力，煞車初期可踩更重；街車則需避免過熱。
          </p>
        </div>

      </div>
    </div>
  );
};
