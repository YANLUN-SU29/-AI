

import React, { useMemo } from 'react';
import { WayPoint, VehicleType } from '../types';

interface TrackSimulationProps {
  imageUrl: string;
  racingLine?: WayPoint[];
  vehicle: VehicleType;
}

export const TrackSimulation: React.FC<TrackSimulationProps> = ({ imageUrl, racingLine, vehicle }) => {
  
  // Convert waypoints to smoothed SVG path using Quadratic Bezier curves
  const svgPath = useMemo(() => {
    if (!racingLine || racingLine.length < 2) return '';

    // Start point
    const p0 = racingLine[0];
    let d = `M ${p0.x} ${p0.y}`;

    // Loop through points to create quadratic curves for smoothing
    // The control point is the original point, the end point is the midpoint between points
    for (let i = 1; i < racingLine.length - 1; i++) {
        const p1 = racingLine[i];
        const p2 = racingLine[i + 1];
        
        // Midpoint
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        
        // Quadratic curve to midpoint using p1 as control
        d += ` Q ${p1.x} ${p1.y} ${mx} ${my}`;
    }

    // Connect to the last point
    const last = racingLine[racingLine.length - 1];
    d += ` L ${last.x} ${last.y}`;

    // Close loop if close enough
    const first = racingLine[0];
    const dist = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
    if (dist < 15) {
      // Curve back to start
      const mx = (last.x + first.x) / 2;
      const my = (last.y + first.y) / 2;
      d += ` Q ${last.x} ${last.y} ${first.x} ${first.y} Z`;
    }

    return d;
  }, [racingLine]);

  // Get vehicle icon (High-tech style with wheels)
  const getVehicleIcon = () => {
    const shadowColor = "#00D2BE"; // Teal glow
    const bodyColor = "#FFFFFF"; // Bright white body
    
    switch (vehicle) {
      case 'F1':
      case 'FormulaE':
        return (
          <g transform="rotate(90) scale(1.5)">
             {/* Glow Effect */}
             <filter id="glowF1" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
               <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
               </feMerge>
             </filter>
             
             {/* Wheels */}
             <rect x="-3" y="-3.5" width="1.5" height="2.5" rx="0.5" fill="#111" />
             <rect x="1.5" y="-3.5" width="1.5" height="2.5" rx="0.5" fill="#111" />
             <rect x="-3.5" y="4" width="2" height="3" rx="0.5" fill="#111" />
             <rect x="1.5" y="4" width="2" height="3" rx="0.5" fill="#111" />

             {/* Body */}
             <path 
               d="M0 -5 L1 -2 L3 0 L1 5 L0 6 L-1 5 L-3 0 L-1 -2 Z" 
               fill={bodyColor} 
               stroke="none" 
               filter="url(#glowF1)"
             />
             {/* Front Wing */}
             <path d="M-3.5 -5 L3.5 -5 L3 -4 L-3 -4 Z" fill={shadowColor} />
             {/* Rear Wing */}
             <path d="M-3 6 L3 6 L3 7.5 L-3 7.5 Z" fill={shadowColor} />
          </g>
        );
      case 'GT3':
      case 'RoadCar':
        return (
          <g transform="rotate(90) scale(1.3)">
             <filter id="glowGT" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
               <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
               </feMerge>
             </filter>
             {/* Wheels */}
             <rect x="-3" y="-3" width="1.5" height="2.5" rx="0.5" fill="#222" />
             <rect x="1.5" y="-3" width="1.5" height="2.5" rx="0.5" fill="#222" />
             <rect x="-3" y="3.5" width="1.5" height="2.5" rx="0.5" fill="#222" />
             <rect x="1.5" y="3.5" width="1.5" height="2.5" rx="0.5" fill="#222" />

             {/* Car Body */}
             <path 
               d="M-2.5 -5 L2.5 -5 L3 0 L2.5 5.5 L-2.5 5.5 L-3 0 Z" 
               fill={bodyColor} 
               filter="url(#glowGT)"
             />
             {/* Windshield */}
             <path d="M-2 -1.5 L2 -1.5 L2.2 1 L-2.2 1 Z" fill="#222" />
             {/* Rear Spoiler */}
             <rect x="-3" y="5" width="6" height="1" fill={shadowColor} />
          </g>
        );
      case 'Karting':
        return (
          <g transform="rotate(90) scale(1.2)">
            <filter id="glowKart" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
               <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
               </feMerge>
             </filter>
             {/* Wheels */}
             <rect x="-3" y="-2" width="1" height="1.5" rx="0.2" fill="#222" />
             <rect x="2" y="-2" width="1" height="1.5" rx="0.2" fill="#222" />
             <rect x="-3.5" y="2" width="1.5" height="2" rx="0.2" fill="#222" />
             <rect x="2" y="2" width="1.5" height="2" rx="0.2" fill="#222" />

             {/* Body */}
             <rect x="-2" y="-2" width="4" height="5" rx="0.5" fill={bodyColor} filter="url(#glowKart)" />
             {/* Driver Helmet */}
             <circle cx="0" cy="1" r="1.2" fill="#f1f1f1" stroke={shadowColor} strokeWidth="0.5" />
             {/* Steering */}
             <line x1="-1.5" y1="-0.5" x2="1.5" y2="-0.5" stroke="black" strokeWidth="0.5" />
          </g>
        );
      default:
        return <circle r="2" fill="white" stroke={shadowColor} strokeWidth="1" />;
    }
  };

  if (!racingLine || racingLine.length === 0) {
    return null;
  }

  return (
    <div className="bg-f1-dark border border-white/10 rounded-lg p-6 mb-6">
      <h3 className="font-display text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-f1-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        AI 賽道模擬 (Track Simulation)
      </h3>
      
      <div className="flex justify-center bg-black/40 rounded-lg border border-white/5 p-2 overflow-hidden">
        <div className="relative inline-block max-h-[60vh] w-auto">
           {/* Background Image */}
           <img 
             src={imageUrl} 
             alt="Track Background" 
             className="block w-full h-auto max-h-[60vh] object-contain opacity-60"
             style={{ filter: 'grayscale(100%) contrast(1.2)' }}
           />
           
           {/* SVG Overlay */}
           <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
           >
              {/* Racing Line Path (Glow Effect) */}
              <path 
                d={svgPath} 
                fill="none" 
                stroke="#00D2BE" 
                strokeWidth="0.6" 
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_5px_rgba(0,210,190,0.6)] opacity-80"
              />

              {/* Animated Vehicle */}
              <g className="vehicle-animation">
                {getVehicleIcon()}
                <animateMotion 
                   dur="8s" 
                   repeatCount="indefinite" 
                   path={svgPath} 
                   rotate="auto"
                   keyPoints="0;1"
                   keyTimes="0;1"
                   calcMode="linear"
                />
              </g>
           </svg>
           
           {/* Disclaimer */}
           <div className="absolute bottom-2 right-2 text-[8px] text-f1-teal/80 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-f1-teal/20">
             AI SIMULATION // {vehicle}
           </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-3 text-center font-mono">
        * 模擬路徑基於 AI 視覺識別真實賽道幾何，已忽略使用者標記以求真實性。
      </p>
    </div>
  );
};