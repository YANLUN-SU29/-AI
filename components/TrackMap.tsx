
import React, { MouseEvent, useState, useRef, useEffect } from 'react';
import { MapMarker, StartConfig } from '../types';

interface TrackMapProps {
  imageUrl: string;
  markers: MapMarker[];
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>;
  startConfig: StartConfig | null;
  setStartConfig: (config: StartConfig | null) => void;
  readOnly?: boolean;
  onClearImage: () => void;
}

type ToolMode = 'marker' | 'start';

export const TrackMap: React.FC<TrackMapProps> = ({ 
  imageUrl, 
  markers, 
  setMarkers, 
  startConfig, 
  setStartConfig, 
  readOnly = false, 
  onClearImage 
}) => {
  const [toolMode, setToolMode] = useState<ToolMode>('marker');
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [isSettingStart, setIsSettingStart] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle adding new marker or starting to set start line
  const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (draggingId !== null) return; // Ignore if dragging an existing marker

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (toolMode === 'marker') {
       // Add Marker Logic (Click to add)
       // We'll add it on MouseUp or Click usually, but to prevent conflict with drag,
       // let's do it here or keep existing logic.
       // The existing logic used onClick. Let's stick to onClick for markers to differentiate from drag.
    } else if (toolMode === 'start') {
      // Start Line Logic (Drag to set direction)
      e.preventDefault(); // Prevent text selection
      setIsSettingStart(true);
      setStartConfig({
        x,
        y,
        angle: 0 // Default angle, will update on drag
      });
    }
  };

  // Handle click for adding markers (separate from drag)
  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    if (readOnly || toolMode !== 'marker') return;
    if (draggingId !== null) return;
    if (isSettingStart) return; 

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: MapMarker = {
      id: markers.length + 1,
      x,
      y
    };

    setMarkers(prev => [...prev, newMarker]);
  };

  // Start dragging a marker
  const handleMarkerMouseDown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent triggering container click
    e.preventDefault(); // Prevent text selection/drag behaviors
    if (readOnly || toolMode !== 'marker') return;
    setDraggingId(id);
  };

  // Remove marker on right click
  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent browser context menu
    e.stopPropagation();
    if (readOnly) return;

    setMarkers(prev => {
      const updatedMarkers = prev.filter(m => m.id !== id);
      // Renumber remaining markers to keep sequence logic simple
      return updatedMarkers.map((m, index) => ({
        ...m,
        id: index + 1
      }));
    });
  };

  // Global drag handling
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Logic for dragging existing markers
      if (draggingId !== null) {
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        setMarkers(prevMarkers => prevMarkers.map(m => m.id === draggingId ? { ...m, x, y } : m));
      }

      // Logic for setting start line direction
      if (isSettingStart && startConfig) {
        const startXPx = (startConfig.x / 100) * rect.width + rect.left;
        const startYPx = (startConfig.y / 100) * rect.height + rect.top;
        
        const deltaX = e.clientX - startXPx;
        const deltaY = e.clientY - startYPx;
        
        // Calculate angle in degrees
        const angleRad = Math.atan2(deltaY, deltaX);
        let angleDeg = angleRad * (180 / Math.PI) + 90; // Add 90 to make 0deg point up (or match visual arrow)
        
        setStartConfig({
          ...startConfig,
          angle: angleDeg
        });
      }
    };

    const handleMouseUp = () => {
      if (draggingId !== null) {
        setDraggingId(null);
      }
      if (isSettingStart) {
        setIsSettingStart(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, isSettingStart, startConfig, setMarkers, setStartConfig]);

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-between bg-black/40 border border-white/10 p-2 rounded-lg">
           <div className="flex gap-2">
             <button
               onClick={() => setToolMode('marker')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                 toolMode === 'marker' 
                   ? 'bg-f1-red text-white' 
                   : 'text-gray-400 hover:text-white hover:bg-white/5'
               }`}
             >
               <div className="w-4 h-4 rounded-full bg-current border-2 border-white/20"></div>
               新增標記 (Marker)
             </button>
             <button
               onClick={() => setToolMode('start')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                 toolMode === 'start' 
                   ? 'bg-f1-teal text-black' 
                   : 'text-gray-400 hover:text-white hover:bg-white/5'
               }`}
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
               </svg>
               設定起跑與方向 (Start)
             </button>
           </div>
           
           <div className="text-[10px] text-gray-500 hidden sm:block">
             {toolMode === 'marker' ? '點擊地圖新增 • 拖曳移動 • 右鍵移除' : '點擊拖曳設定方向'}
           </div>
        </div>
      )}

      <div className="relative group select-none">
        <div 
          ref={containerRef}
          className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center bg-black border-f1-teal/50 
            ${!readOnly ? (toolMode === 'marker' ? 'cursor-crosshair' : 'cursor-default') : ''}`}
          onClick={handleContainerClick}
          onMouseDown={handleContainerMouseDown}
        >
          <img 
            src={imageUrl} 
            alt="Track Preview" 
            className="w-full h-full object-contain pointer-events-none p-4"
          />
          
          {/* Start Line Marker */}
          {startConfig && (
            <div 
               className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
               style={{ 
                 left: `${startConfig.x}%`, 
                 top: `${startConfig.y}%`,
                 transform: `translate(-50%, -50%) rotate(${startConfig.angle}deg)`
               }}
            >
               {/* Green Arrow Icon */}
               <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="drop-shadow-lg filter">
                 <path d="M20 0L35 25H25V40H15V25H5L20 0Z" fill="#00D2BE" stroke="white" strokeWidth="2"/>
               </svg>
            </div>
          )}

          {/* Markers Overlay */}
          {markers.map((marker, index) => (
            <div
              key={marker.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${draggingId === marker.id ? 'z-50' : 'z-10'}`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-lg transition-transform 
                  ${draggingId === marker.id ? 'bg-f1-red text-white scale-110 cursor-grabbing border-white' : 'bg-f1-red text-white border-white cursor-grab hover:scale-110'}
                  ${toolMode === 'start' ? 'opacity-50' : 'opacity-100'}
                `}
                onMouseDown={(e) => handleMarkerMouseDown(e, marker.id)}
                onContextMenu={(e) => handleContextMenu(e, marker.id)}
              >
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
