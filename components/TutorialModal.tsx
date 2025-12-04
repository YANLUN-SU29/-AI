
import React, { useState } from 'react';
import { VehicleType } from '../types';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'braking' | 'vehicle'>('braking');

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

  const vehicles = [
    {
      id: 'F1',
      name: 'Formula 1',
      icon: '🏎️',
      desc: '極致空力與碳纖維煞車',
      physics: 'F1 賽車在高速時擁有驚人的下壓力 (Downforce)，這意味著速度越快、抓地力越強。因此煞車技巧是「重踩輕放」：在高速入彎瞬間踩下極大煞車力道 (因為下壓力大不會鎖死)，隨著速度降低、下壓力減少，必須迅速鬆開煞車 (Trail Braking) 以避免輪胎鎖死。',
      strategy: '關注輪胎熱衰竭 (Thermal Deg) 與 DRS 使用時機。'
    },
    {
      id: 'FormulaE',
      name: 'Formula E',
      icon: '⚡',
      desc: '電能管理與街道賽霸主',
      physics: '電動方程式賽車抓地力較低 (全天候胎)，且沒有太多下壓力。其核心在於「動能回收 (Regen)」。車手必須在入彎前執行 "Lift and Coast" (提早收油滑行)，利用馬達回充來減速，最後才踩下物理煞車。這與 F1 的晚煞車風格截然不同。',
      strategy: '電量管理 (Energy Management) 是獲勝唯一關鍵。'
    },
    {
      id: 'GT3',
      name: 'GT3 / 房車',
      icon: '🚗',
      desc: '依賴電控與機械抓地',
      physics: 'GT3 賽車車重較重 (~1250kg)，慣性大。但配備了 ABS (防鎖死) 與 TC (循跡防滑)。駕駛 GT3 可以依賴 ABS 進行重煞，並利用車身重心轉移 (Weight Transfer) 來幫助轉向。出彎時可以較早補油，依賴 TC 控制後輪滑動。',
      strategy: '保護輪胎與煞車系統過熱 (Brake Fade) 是長距離賽事的重點。'
    },
    {
      id: 'Karting',
      name: '卡丁車 (Karting)',
      icon: '🏁',
      desc: '無懸吊的純粹機械結構',
      physics: '卡丁車沒有懸吊系統，且後軸是實心的 (無差速器)。為了過彎，車手必須透過重煞車或轉動方向盤產生的幾何效應 (Jacking Effect) 來抬起內側後輪。駕駛風格必須保持動能 (Momentum)，避免大幅度的轉向動作導致引擎轉速下降。',
      strategy: '路線必須圓滑，減少輪胎橫向滑動以維持出彎轉速。'
    },
    {
      id: 'RoadCar',
      name: '高性能街車',
      icon: '🚙',
      desc: '街道胎與舒適懸吊',
      physics: '一般跑車即使馬力很大，但受限於街道胎 (Street Tires) 與較軟的懸吊。煞車與輪胎非常容易過熱 (Heat Fade)。過彎時車身側傾 (Body Roll) 大，反應較慢。駕駛守則是「慢進快出 (Slow in, Fast out)」，不要嘗試挑戰煞車極限。',
      strategy: '冷卻圈 (Cool down lap) 至關重要，避免連續衝刺。'
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
      <div className="relative bg-f1-dark border border-white/10 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in-up flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-f1-dark/95 border-b border-white/10 p-6 flex justify-between items-center backdrop-blur">
          <div>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-f1-teal">SYSTEM</span> 遙測系統指南
            </h2>
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

        {/* Detailed Introduction Section */}
        <div className="px-6 pt-6 pb-2">
           <div className="bg-gradient-to-br from-f1-carbon to-black border border-white/10 rounded-lg p-6 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 bg-f1-teal/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-f1-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                關於賽道遙測與物理模型
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300 leading-relaxed">
                <div>
                  <p className="mb-3">
                    本系統運用 AI 視覺模型模擬專業賽車工程師的分析邏輯。透過識別賽道幾何形狀、路面寬度與彎角半徑，並結合您選擇的 <strong className="text-white">車輛物理參數</strong> (如 F1 的下壓力或 Karting 的極高抓地力)，計算出最佳的行車路線與煞車點。
                  </p>
                  <p>
                    所謂的「煞車點」並非只是一個減速的位置，它是 <strong className="text-f1-red">重心轉移 (Weight Transfer)</strong> 的起點。正確的煞車能壓縮前懸吊，增加前輪抓地力，從而提升入彎速度。
                  </p>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <p className="mb-3">
                    <span className="text-f1-teal font-bold block mb-1">如何閱讀分析報告？</span>
                    報告中的每個彎道都標示了 <strong className="text-white">煞車強度 (Braking Zone)</strong>。這代表了在入彎前您需要施加在踏板上的壓力百分比。
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li><span className="text-white">Heavy</span>: 全力煞車，通常伴隨大幅降檔。</li>
                    <li><span className="text-white">Trail Braking</span>: 入彎時逐漸鬆開煞車的技巧。</li>
                    <li><span className="text-white">Apex</span>: 彎道頂點，通常是開始重新補油的時刻。</li>
                  </ul>
                </div>
              </div>
           </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 mt-6 border-b border-white/10 flex gap-6">
          <button
            onClick={() => setActiveTab('braking')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'braking' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            煞車技巧解析
            {activeTab === 'braking' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-f1-red shadow-[0_0_10px_#FF1801]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'vehicle' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            車輛特性指南
            {activeTab === 'vehicle' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-f1-teal shadow-[0_0_10px_#00D2BE]"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          
          {/* TAB 1: Braking Zones */}
          {activeTab === 'braking' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
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
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-400 w-12 text-right">BRAKE</span>
                      <div className="flex-1 h-3 bg-gray-800 rounded-sm overflow-hidden relative">
                        <div 
                            className="h-full bg-f1-red transition-all duration-500"
                            style={{ width: `${zone.brakeLevel}%` }}
                        ></div>
                        <div className="absolute inset-0 flex justify-between px-[1px]">
                            <div className="w-[1px] h-full bg-black/20"></div>
                            <div className="w-[1px] h-full bg-black/20"></div>
                            <div className="w-[1px] h-full bg-black/20"></div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-f1-red w-8 text-right">{zone.brakeLevel}%</span>
                    </div>

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
          )}

          {/* TAB 2: Vehicle Characteristics */}
          {activeTab === 'vehicle' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-f1-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    為何選擇正確的車型如此重要？ (Engineering Context)
                </h4>
                <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                  選擇正確的車輛模型對於獲取精準的遙測分析至關重要。不同的賽車工程設計將直接改變「最佳行車線」與「煞車節奏」。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                    <ul className="space-y-2 list-disc list-inside">
                        <li><strong className="text-white">下壓力 (Downforce)</strong>: F1 等空力車型在高速時擁有極大抓地力，可全油門過彎；而 GT3 或街車則需大幅減速。</li>
                        <li><strong className="text-white">車重與慣性 (Mass)</strong>: 重量是影響煞車距離的最大變因。較重的街車需要比 F1 早數百公尺開始煞車。</li>
                    </ul>
                    <ul className="space-y-2 list-disc list-inside">
                        <li><strong className="text-white">動力單元特性</strong>: 電動車 (Formula E) 需依賴「動能回收 (Regen)」減速，這創造了獨特的 "Lift & Coast" 駕駛節奏。</li>
                        <li><strong className="text-white">懸吊結構</strong>: 卡丁車沒有懸吊，需靠轉向幾何抬起後輪過彎，這與傳統賽車的重心轉移邏輯完全不同。</li>
                    </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="bg-black/20 border border-white/10 rounded-lg p-5 hover:border-white/20 transition-all flex flex-col group hover:bg-white/5">
                     <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl bg-white/5 p-2 rounded-lg group-hover:scale-110 transition-transform">{v.icon}</span>
                        <div>
                           <h3 className="text-white font-bold text-lg">{v.name}</h3>
                           <span className="text-xs text-f1-teal font-medium uppercase tracking-wide border border-f1-teal/30 px-2 py-0.5 rounded">{v.desc}</span>
                        </div>
                     </div>
                     <div className="space-y-4 mt-2">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1 border-b border-white/5 pb-1">物理特性 (Physics Model)</span>
                          <p className="text-sm text-gray-300 leading-relaxed text-justify">{v.physics}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1 border-b border-white/5 pb-1">駕駛策略 (Strategy Focus)</span>
                          <p className="text-sm text-gray-400 leading-relaxed">{v.strategy}</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/10 text-center mt-auto">
          <p className="text-xs text-gray-500">
            * 本指南提供的數據僅供參考。實際賽道駕駛請始終以安全為優先，並遵守當地賽道規範。
          </p>
        </div>

      </div>
    </div>
  );
};
