
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { MapMarker, VehicleType, CornerAnalysis } from '../types';

interface TrackSimulationProps {
  imageUrl: string;
  markers: MapMarker[];
  corners: CornerAnalysis[];
  vehicle: VehicleType;
}

export const TrackSimulation: React.FC<TrackSimulationProps> = ({ imageUrl, markers, corners, vehicle }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [carPos, setCarPos] = useState({ x: 0, y: 0, angle: 0 });
  const [gForce, setGForce] = useState({ lat: 0, long: 0 });
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [activeCorner, setActiveCorner] = useState<CornerAnalysis | null>(null);

  // 1. Generate smooth path from markers using Catmull-Rom spline or simple Bezier
  const svgPath = useMemo(() => {
    if (!markers || markers.length < 2) return '';

    // Sort markers by ID just in case
    const sortedPoints = [...markers].sort((a, b) => a.id - b.id);
    
    // Close the loop
    const points = [...sortedPoints, sortedPoints[0]];

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[points.length - 2];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : points[1];

      // Catmull-Rom to Cubic Bezier conversion factors
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }

    return d;
  }, [markers]);

  // 2. Physics Simulation Loop
  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    let distance = 0;
    let speed = 0.2; // Base speed % per frame
    let lastTime = performance.now();
    let animationFrameId: number;

    // Simulation State
    let currentVel = 0; // Actual velocity

    const simulate = (time: number) => {
      const dt = (time - lastTime) / 16; // Normalize to ~60fps
      lastTime = time;

      // A. Determine Target Speed based on proximity to markers (Corners)
      // Find closest marker to current distance
      const currentPoint = path.getPointAtLength(distance);
      let nearestMarkerDist = Number.MAX_VALUE;
      let targetCorner: CornerAnalysis | undefined;
      let approachingCorner = false;

      // Find nearest marker logic (Simplified: check geometric distance)
      markers.forEach((m, idx) => {
          // Calculate roughly where this marker is on the path (this is expensive in loop, strictly we should pre-calc marker lengths)
          // For optimization, we use Euclidean dist to the marker point
          const dx = currentPoint.x - m.x;
          const dy = currentPoint.y - m.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < nearestMarkerDist) {
              nearestMarkerDist = dist;
              // Link marker ID to corners
              targetCorner = corners.find(c => c.number === m.id);
          }
      });

      // Logic: If close to a marker (e.g. < 5 units), we are "in" the corner.
      // If "approaching" (distance closing), we brake.
      const CORNER_RADIUS_THRESHOLD = 8;
      const isInCorner = nearestMarkerDist < CORNER_RADIUS_THRESHOLD;
      
      // B. Calculate Target Velocity
      let targetVel = 1.5; // Max speed (Straight)
      
      if (vehicle === 'F1') targetVel = 2.0;
      if (vehicle === 'Karting') targetVel = 0.8;

      let difficultyFactor = 1;
      let brakingIntensity = 0;

      if (targetCorner) {
          // Adjust based on difficulty (1-10)
          difficultyFactor = 1 - (targetCorner.difficulty / 15); // Higher difficulty = slower corner speed
          
          // Adjust braking based on zone
          switch(targetCorner.brakingZone) {
              case 'Heavy': brakingIntensity = 0.08; break;
              case 'Medium': brakingIntensity = 0.05; break;
              case 'Light': brakingIntensity = 0.02; break;
              default: brakingIntensity = 0.01;
          }
      }

      if (isInCorner) {
          // We are in the corner, target speed is limited by grip/difficulty
          targetVel = targetVel * 0.4 * difficultyFactor;
          setActiveCorner(targetCorner || null);
      } else {
          setActiveCorner(null);
      }

      // C. Update Physics (Accelerate / Brake)
      let longG = 0;
      if (currentVel < targetVel) {
          // Accelerate
          const accel = (vehicle === 'F1' || vehicle === 'FormulaE') ? 0.02 : 0.01;
          currentVel += accel * dt;
          longG = 0.5 + (accel * 20); // Simulated Positive G
      } else {
          // Decelerate (Braking)
          // If in corner, slow down naturally. If approaching, brake harder.
          const brakeForce = isInCorner ? 0.01 : brakingIntensity; 
          currentVel -= brakeForce * dt;
          longG = -1.0 - (brakeForce * 50); // Simulated Negative G
      }
      
      // Clamp speed
      currentVel = Math.max(0.1, currentVel);
      setCurrentSpeed(currentVel * 100); // For display

      // D. Move Car
      distance += currentVel * dt;
      if (distance > totalLength) distance = 0;

      const p1 = path.getPointAtLength(distance);
      // Look ahead for angle
      const lookAhead = 1.0; 
      const p2Dist = (distance + lookAhead) % totalLength;
      const p2 = path.getPointAtLength(p2Dist);

      const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angleDeg = angleRad * (180 / Math.PI);

      // E. Calculate Lateral G (Centripetal: v^2 / r)
      // Estimate radius by change in angle
      const p3Dist = (distance - lookAhead + totalLength) % totalLength;
      const p3 = path.getPointAtLength(p3Dist);
      const prevAngleRad = Math.atan2(p1.y - p3.y, p1.x - p3.x);
      
      // Angular velocity (change in angle per distance unit)
      let angleDiff = angleRad - prevAngleRad;
      // Normalize angle diff
      while (angleDiff <= -Math.PI) angleDiff += 2*Math.PI;
      while (angleDiff > Math.PI) angleDiff -= 2*Math.PI;
      
      // Lat G roughly proportional to velocity * turn rate
      let latG = angleDiff * (currentVel * 15);
      
      // Smoothing G-force output
      setGForce(prev => ({
          lat: prev.lat * 0.8 + latG * 0.2,
          long: prev.long * 0.8 + longG * 0.2
      }));

      setCarPos({
          x: p1.x,
          y: p1.y,
          angle: angleDeg
      });

      animationFrameId = requestAnimationFrame(simulate);
    };

    animationFrameId = requestAnimationFrame(simulate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [svgPath, vehicle, corners, markers]);


  // Vehicle Icon
  const getVehicleIcon = () => {
    // Re-use logic or simplify
    return (
        <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle}) scale(${vehicle === 'Karting' ? 0.15 : 0.2})`}>
            {/* Simple Arrow Car */}
            <path d="M-5 -5 L5 0 L-5 5 Z" fill="#fff" stroke="none" />
            {/* Glow */}
            <circle r="8" fill="url(#carGlow)" opacity="0.5" />
        </g>
    );
  };

  if (!markers || markers.length < 2) return null;

  return (
    <div className="bg-f1-dark border border-white/10 rounded-lg p-6 mb-6 relative overflow-hidden group">
      {/* Dynamic Background Gradient based on G-Force */}
      <div 
        className={`absolute inset-0 opacity-10 transition-colors duration-300 pointer-events-none ${
            gForce.long < -1.5 ? 'bg-f1-red' : 
            Math.abs(gForce.lat) > 1.5 ? 'bg-f1-teal' : 'bg-transparent'
        }`} 
      />

      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="font-display text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4 text-f1-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 動態 G 力模擬 (Dynamic G-Force Sim)
        </h3>
        {activeCorner && (
            <div className="bg-f1-red text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                CORNER {activeCorner.number}: {activeCorner.type}
            </div>
        )}
      </div>
      
      <div className="relative w-full h-[400px] bg-black/50 rounded-lg border border-white/5 overflow-hidden">
         {/* Track Map Layer */}
         <img 
            src={imageUrl} 
            alt="Track" 
            className="absolute inset-0 w-full h-full object-contain opacity-40 mix-blend-screen"
         />

         {/* SVG Simulation Layer */}
         <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <defs>
                 <radialGradient id="carGlow" cx="0.5" cy="0.5" r="0.5">
                     <stop offset="0%" stopColor={vehicle === 'F1' ? '#00D2BE' : '#FF1801'} stopOpacity="1" />
                     <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                 </radialGradient>
             </defs>
             
             {/* Invisible Path for Calculation */}
             <path ref={pathRef} d={svgPath} fill="none" stroke="none" />
             
             {/* Visible Racing Line */}
             <path 
                d={svgPath} 
                fill="none" 
                stroke={Math.abs(gForce.lat) > 1.5 ? "#FF1801" : "#00D2BE"} 
                strokeWidth="0.8" 
                strokeDasharray="2 1"
                className="transition-colors duration-300 opacity-60"
             />

             {/* Car */}
             {getVehicleIcon()}
         </svg>

         {/* G-Meter HUD (Bottom Right) */}
         <div className="absolute bottom-4 right-4 w-28 h-28 bg-black/80 backdrop-blur-md rounded-full border-2 border-white/10 flex items-center justify-center shadow-xl">
             {/* Grid */}
             <div className="absolute inset-0 rounded-full opacity-30">
                 <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white"></div>
                 <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white"></div>
                 <div className="absolute inset-4 rounded-full border border-white/20"></div>
                 <div className="absolute inset-8 rounded-full border border-white/20"></div>
             </div>

             {/* G-Dot */}
             <div 
                className={`absolute w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-transform duration-75 ease-out
                    ${Math.sqrt(gForce.lat**2 + gForce.long**2) > 2 ? 'bg-f1-red scale-125' : 'bg-f1-teal'}
                `}
                style={{ 
                    // Lat G = X axis, Long G = Y axis (Negative Long G is braking = Up visually or Down? Usually braking throws you forward, so G is negative. Let's map Brake -> Up/Forward on graph)
                    transform: `translate(${gForce.lat * 20}px, ${-gForce.long * 15}px)` 
                }}
             ></div>
             
             {/* Labels */}
             <div className="absolute top-2 text-[8px] text-gray-500 font-mono">LONG</div>
             <div className="absolute right-2 text-[8px] text-gray-500 font-mono">LAT</div>
             
             {/* Value Readout */}
             <div className="absolute -bottom-6 w-full text-center">
                 <div className="text-[10px] font-mono text-white font-bold">
                    {Math.abs(gForce.lat).toFixed(1)}G <span className="text-gray-500">LAT</span>
                 </div>
                 <div className="text-[10px] font-mono text-white font-bold">
                    {gForce.long.toFixed(1)}G <span className="text-gray-500">LONG</span>
                 </div>
             </div>
         </div>

         {/* Speed/Telemetry Text (Bottom Left) */}
         <div className="absolute bottom-4 left-4 font-mono">
             <div className="text-2xl font-bold text-white italic">
                 {Math.round(currentSpeed * (vehicle === 'F1' ? 3 : 1.5))} <span className="text-xs text-gray-400 not-italic">KPH</span>
             </div>
             <div className="flex gap-2 text-[9px] text-gray-400 mt-1">
                 <span className={gForce.long > 0 ? 'text-f1-teal font-bold' : ''}>THROTTLE</span>
                 <span className="text-gray-700">|</span>
                 <span className={gForce.long < 0 ? 'text-f1-red font-bold' : ''}>BRAKE</span>
             </div>
         </div>
      </div>
      
      <p className="text-[10px] text-gray-500 mt-2 text-right font-mono">
         * 模擬數據基於彎道幾何與 {vehicle} 物理參數運算
      </p>
    </div>
  );
};
