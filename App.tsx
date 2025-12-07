

import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Header } from './components/Header';
import { CornerCard } from './components/CornerCard';
import { StrategyPanel } from './components/StrategyPanel';
import { WeatherSelector } from './components/WeatherSelector';
import { VehicleSelector } from './components/VehicleSelector';
import { TrackMap } from './components/TrackMap';
import { TelemetryPanel } from './components/TelemetryPanel';
import { TrackInfoInput } from './components/TrackInfoInput';
// import { TrackSimulation } from './components/TrackSimulation'; // Removed as per request
import { TutorialModal } from './components/TutorialModal';
import { analyzeTrackImage } from './services/geminiService';
import { AnalysisStatus, TrackAnalysis, UploadState, WeatherCondition, MapMarker, VehicleType, StartConfig, VideoAnalysisMode } from './types';

function App() {
  const [uploadState, setUploadState] = useState<UploadState>({ file: null, previewUrl: null, mediaType: 'image' });
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [startConfig, setStartConfig] = useState<StartConfig | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [weather, setWeather] = useState<WeatherCondition>('Dry');
  const [vehicle, setVehicle] = useState<VehicleType>('F1');
  const [trackName, setTrackName] = useState<string>('');
  const [trackLength, setTrackLength] = useState<string>('');
  const [videoMode, setVideoMode] = useState<VideoAnalysisMode>('FullLap');
  const [analysis, setAnalysis] = useState<TrackAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Determine if we are in "Marking Mode" (File uploaded but not analyzed yet)
  const isMarkingMode = uploadState.previewUrl && !analysis;

  const loadingSteps = [
    { id: 0, title: "掃描賽道幾何/影像", subtitle: "Scanning Geometry & Footage" },
    { id: 1, title: "物理模型運算", subtitle: "Calculating Physics & Grip" },
    { id: 2, title: "最佳路線模擬", subtitle: "Simulating Racing Lines" },
    { id: 3, title: "生成策略報告", subtitle: "Compiling Telemetry Data" }
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === AnalysisStatus.ANALYZING) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Helper to validate file type more robustly
  const validateFile = (file: File): { valid: boolean; type: 'image' | 'video' | null; error?: string } => {
    const isVideoMime = file.type.startsWith('video/');
    const isImageMime = file.type.startsWith('image/');
    
    // Check extensions because sometimes MIME types are missing or generic
    const isVideoExt = /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(file.name);
    const isImageExt = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);

    if (isVideoMime || isVideoExt) {
       // Size check: 60MB limit for browser stability
       if (file.size > 60 * 1024 * 1024) {
         return { valid: false, type: 'video', error: '影片檔案過大 (>60MB)。請上傳較短的片段以確保分析順暢。' };
       }
       return { valid: true, type: 'video' };
    }

    if (isImageMime || isImageExt) {
      return { valid: true, type: 'image' };
    }

    return { valid: false, type: null, error: '不支援的檔案格式。請上傳 JPG, PNG 圖片或 MP4, MOV 影片。' };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error || '檔案無效');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setUploadState({ file, previewUrl, mediaType: validation.type! });
      setMarkers([]); // Reset markers
      setStartConfig(null); // Reset start line
      setVideoMode('FullLap'); // Reset video mode
      setStatus(AnalysisStatus.IDLE);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleClearImage = () => {
    setUploadState({ file: null, previewUrl: null, mediaType: 'image' });
    setMarkers([]);
    setStartConfig(null);
    setAnalysis(null);
    setStatus(AnalysisStatus.IDLE);
    setTrackName('');
    setTrackLength('');
  };

  /**
   * Generates a new Base64 image string with markers and start line drawn on top.
   */
  const generateMarkedImage = async (file: File, markers: MapMarker[], startConfig: StartConfig | null): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use the natural size of the image for high quality
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Could not get canvas context');
          return;
        }

        // 1. Draw original image
        ctx.drawImage(img, 0, 0);

        const scaleBase = Math.max(img.width, img.height);
        
        // 2. Draw Start Line (if exists)
        if (startConfig) {
          const sx = (startConfig.x / 100) * img.width;
          const sy = (startConfig.y / 100) * img.height;
          const arrowSize = scaleBase * 0.04;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate((startConfig.angle * Math.PI) / 180);

          // Draw Arrow shape
          ctx.beginPath();
          ctx.moveTo(0, -arrowSize); // Tip
          ctx.lineTo(arrowSize * 0.6, arrowSize * 0.6); // Bottom Right
          ctx.lineTo(0, arrowSize * 0.2); // Inner Notch
          ctx.lineTo(-arrowSize * 0.6, arrowSize * 0.6); // Bottom Left
          ctx.closePath();
          
          ctx.fillStyle = '#00D2BE'; // F1 Teal
          ctx.fill();
          ctx.lineWidth = arrowSize * 0.1;
          ctx.strokeStyle = 'white';
          ctx.stroke();
          
          ctx.restore();
        }

        // 3. Draw markers
        const radius = scaleBase * 0.025; // 2.5% of max dimension
        const fontSize = scaleBase * 0.02;
        const lineWidth = radius * 0.15;

        markers.forEach((marker, index) => {
          const x = (marker.x / 100) * img.width;
          const y = (marker.y / 100) * img.height;
          const number = index + 1;

          // Circle
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = '#FF1801'; // F1 Red
          ctx.fill();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = 'white';
          ctx.stroke();

          // Number
          ctx.fillStyle = 'white';
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(number.toString(), x, y);
        });

        // Return as JPEG base64
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = reject;
    });
  };

  const handleAnalyze = async () => {
    if (!uploadState.file) return;

    try {
      setStatus(AnalysisStatus.ANALYZING);
      
      let inputPayload: File | string = uploadState.file;
      
      // Only process markers overlay if it's an image
      if (uploadState.mediaType === 'image') {
        const hasOverlay = markers.length > 0 || startConfig !== null;
        if (hasOverlay) {
          inputPayload = await generateMarkedImage(uploadState.file, markers, startConfig);
        }
      }

      const result = await analyzeTrackImage(
        inputPayload, 
        weather, 
        vehicle, 
        markers, 
        trackName,
        trackLength,
        uploadState.mediaType,
        videoMode
      );
      setAnalysis(result);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      let errorMessage = '分析失敗。AI 無法處理此檔案，請確保影像或影片清晰且格式正確。';
      
      // Basic Error Parsing
      if (err.message && err.message.includes('400')) {
        errorMessage = '影像格式錯誤或無法辨識，請嘗試其他圖片。';
      } else if (err.message && err.message.includes('503')) {
        errorMessage = 'AI 服務暫時繁忙，請稍後再試。';
      } else if (err.message && err.message.includes('safety')) {
        errorMessage = '影像內容被系統攔截，請確認內容符合規範。';
      }

      setError(errorMessage);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleExportPDF = async () => {
    if (!resultsRef.current || !analysis) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2, // Improve quality
        useCORS: true,
        backgroundColor: '#0d0d10', // Match body bg
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${analysis.circuitName || 'Track_Analysis'}_Report.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      setError("PDF 匯出失敗，請重試");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        const previewUrl = URL.createObjectURL(file);
        setUploadState({ file, previewUrl, mediaType: validation.type! });
        setMarkers([]);
        setStartConfig(null);
        setVideoMode('FullLap');
        setStatus(AnalysisStatus.IDLE);
        setAnalysis(null);
        setError(null);
      } else {
        setError(validation.error || '不支援的檔案。');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onOpenTutorial={() => setIsTutorialOpen(true)} />
      
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section */}
        {status === AnalysisStatus.IDLE && !uploadState.previewUrl && (
          <div className="text-center py-12">
             <h2 className="text-3xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
               賽道遙測與策略 AI
             </h2>
             <p className="text-gray-400 max-w-2xl mx-auto mb-8">
               上傳賽道圖或賽車影片（MP4/MOV），透過 AI 視覺即時分析煞車點、彎道技巧與遙測數據預估。
               支援 F1、Formula E、GT3、卡丁車等多種車型。
             </p>
          </div>
        )}
        
        {/* Global Error Message (Upload related) */}
        {status !== AnalysisStatus.ERROR && error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-900/20 border border-f1-red/50 text-red-200 p-4 rounded-lg text-sm flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <button onClick={() => setError(null)} className="ml-auto hover:text-white">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Top Section: Visualization & Controls - Always Wide */}
          {/* Main container keeps full width regardless of analysis state */}
          <div className="lg:col-span-10 lg:col-start-2 flex flex-col gap-6 transition-all duration-500">
            
            {uploadState.previewUrl ? (
              <div className="flex flex-col gap-3">
                {uploadState.mediaType === 'video' ? (
                  <div className="relative border-2 border-dashed border-f1-teal/50 bg-black rounded-xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center p-2 group">
                    <video 
                      src={uploadState.previewUrl} 
                      controls 
                      className="w-full h-full object-contain max-h-[500px] rounded-lg"
                    />
                    
                    {/* Clear Button */}
                    <button 
                      onClick={handleClearImage}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-f1-red text-white rounded-full p-2 transition-colors z-20"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* VIDEO MODE Banner */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1 z-20 pointer-events-none">
                        <div className="bg-f1-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,24,1,0.5)] flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            VIDEO ANALYSIS ACTIVE
                        </div>
                    </div>

                    {/* Feature Disabled Notification (Bottom Overlay) */}
                    <div className="absolute bottom-4 left-4 right-4 bg-f1-dark/95 backdrop-blur-md border-l-4 border-f1-teal p-4 rounded-r-lg shadow-xl z-20 flex items-start gap-4">
                        <div className="p-2 bg-f1-teal/10 rounded-full shrink-0">
                           <svg className="w-6 h-6 text-f1-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                           </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                                AI 自動影像分析模式 <span className="text-[10px] bg-f1-teal text-black px-2 py-0.5 rounded font-mono">ACTIVE</span>
                            </h4>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                系統將自動掃描影片影格以識別賽道特徵與行車動態。
                                <span className="block mt-1 text-gray-500 font-medium">
                                  * 此模式下已停用「手動標記」與「起跑線」工具，AI 將全權接管分析。
                                </span>
                            </p>
                        </div>
                    </div>
                  </div>
                ) : (
                  <TrackMap 
                    imageUrl={uploadState.previewUrl} 
                    markers={markers}
                    setMarkers={setMarkers}
                    startConfig={startConfig}
                    setStartConfig={setStartConfig}
                    onClearImage={handleClearImage}
                    readOnly={analysis !== null} // Switch to ReadOnly when analyzed
                  />
                )}
              </div>
            ) : (
              <div 
                className="relative border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 rounded-xl overflow-hidden transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center p-8 pointer-events-none">
                  <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-300 font-medium">拖放 圖片 或 影片 到此處</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">支援 .JPG, .PNG, .MP4, .MOV, .MKV</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*,.mkv,.mov"
                  onChange={handleFileSelect} 
                />
              </div>
            )}

            {/* Controls */}
            {uploadState.file && (
              <div className="bg-f1-carbon/50 border border-white/5 rounded-xl p-4 animate-fade-in space-y-4">
                 
                 <TrackInfoInput 
                    trackName={trackName}
                    setTrackName={setTrackName}
                    trackLength={trackLength}
                    setTrackLength={setTrackLength}
                    disabled={status === AnalysisStatus.ANALYZING}
                 />

                 <VehicleSelector 
                   vehicle={vehicle}
                   setVehicle={setVehicle}
                   disabled={status === AnalysisStatus.ANALYZING}
                 />
                 
                 {/* Video Analysis Mode Selector */}
                 {uploadState.mediaType === 'video' && (
                   <div className="flex flex-col gap-2 mb-2 w-full animate-fade-in">
                     <div className="flex items-center justify-between">
                        <label className="text-xs text-f1-teal uppercase tracking-wider font-semibold flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-f1-teal rounded-full"></span>
                           影片分析範圍 (Video Analysis Scope)
                        </label>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                       <button
                         onClick={() => setVideoMode('FullLap')}
                         disabled={status === AnalysisStatus.ANALYZING}
                         className={`py-3 px-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                           videoMode === 'FullLap' 
                             ? 'bg-f1-teal text-black border-f1-teal shadow-[0_0_15px_rgba(0,210,190,0.2)]' 
                             : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                         }`}
                       >
                         {videoMode === 'FullLap' && (
                           <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                           </svg>
                         )}
                         完整單圈
                         <span className="text-[9px] opacity-70 font-mono">FULL LAP</span>
                       </button>
                       <button
                         onClick={() => setVideoMode('KeyCorners')}
                         disabled={status === AnalysisStatus.ANALYZING}
                         className={`py-3 px-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                           videoMode === 'KeyCorners' 
                             ? 'bg-f1-teal text-black border-f1-teal shadow-[0_0_15px_rgba(0,210,190,0.2)]' 
                             : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                         }`}
                       >
                         {videoMode === 'KeyCorners' && (
                           <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                           </svg>
                         )}
                         關鍵彎道
                         <span className="text-[9px] opacity-70 font-mono">KEY CORNERS</span>
                       </button>
                       <button
                         onClick={() => setVideoMode('SpecificSection')}
                         disabled={status === AnalysisStatus.ANALYZING}
                         className={`py-3 px-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                           videoMode === 'SpecificSection' 
                             ? 'bg-f1-teal text-black border-f1-teal shadow-[0_0_15px_rgba(0,210,190,0.2)]' 
                             : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                         }`}
                       >
                         {videoMode === 'SpecificSection' && (
                           <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                           </svg>
                         )}
                         特定區段
                         <span className="text-[9px] opacity-70 font-mono">SECTION</span>
                       </button>
                     </div>
                   </div>
                 )}

                 <WeatherSelector 
                   weather={weather} 
                   setWeather={setWeather} 
                   disabled={status === AnalysisStatus.ANALYZING} 
                 />

                {status !== AnalysisStatus.ANALYZING && status !== AnalysisStatus.SUCCESS && (
                  <button
                    onClick={handleAnalyze}
                    className="w-full bg-f1-red hover:bg-red-700 text-white font-display font-bold text-lg py-4 rounded-lg shadow-lg shadow-red-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    開始分析 {uploadState.mediaType === 'video' ? '影片' : '賽道'}
                  </button>
                )}

                {status === AnalysisStatus.SUCCESS && (
                   <button
                   onClick={handleAnalyze}
                   className="w-full bg-f1-carbon border border-white/20 hover:bg-white/5 text-white font-display font-bold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                   </svg>
                   重新分析
                 </button>
                )}
              </div>
            )}

            {status === AnalysisStatus.ANALYZING && (
              <div className="bg-f1-dark/95 border border-f1-teal/30 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[450px] backdrop-blur-xl shadow-[0_0_50px_rgba(0,210,190,0.1)]">
                
                {/* 1. Matrix/Data Background Effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,transparent,rgba(0,210,190,0.2),transparent)] translate-y-[-100%] animate-[scan_3s_linear_infinite]"></div>
                  <div className="grid grid-cols-12 gap-2 h-full w-full opacity-30">
                      {Array.from({ length: 48 }).map((_, i) => (
                          <div key={i} className="text-[8px] font-mono text-f1-teal animate-pulse" style={{ animationDelay: `${Math.random() * 2}s` }}>
                              {Math.random() > 0.5 ? '10110' : '01001'}
                          </div>
                      ))}
                  </div>
                </div>

                {/* 2. Central Animation: Rotating Pirelli Tire (Red/Soft) */}
                <div className="relative mb-12 transform scale-125">
                   {/* Tire Container - WHOLE WHEEL SPINS SLOWLY (3s) */}
                   <div className="relative w-48 h-48 animate-[spin_3s_linear_infinite]">
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                          {/* 2.1 Tire Carcass (Black) */}
                          <circle cx="50" cy="50" r="48" fill="#151515" stroke="#050505" strokeWidth="2" />
                          
                          {/* 2.2 Red Stripe (Soft Compound) */}
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#FF1801" strokeWidth="2.5" opacity="0.95" />
                          
                          {/* 2.3 Sidewall Text Path */}
                          <defs>
                              <path id="textCircle" d="M 50, 50 m -33, 0 a 33,33 0 1,1 66,0 a 33,33 0 1,1 -66,0" />
                          </defs>
                          <text fill="#FF1801" fontSize="8" fontWeight="900" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                              {/* Top Text - P ZERO (Centered at 25% of path) */}
                              <textPath href="#textCircle" startOffset="25%" textAnchor="middle" alignmentBaseline="middle" letterSpacing="1.5">P ZERO</textPath>
                              {/* Bottom Text - PIRELLI (Centered at 75% of path) */}
                              <textPath href="#textCircle" startOffset="75%" textAnchor="middle" alignmentBaseline="middle" letterSpacing="1">PIRELLI</textPath>
                          </text>
                          
                          {/* 2.4 The Rim (Dark Magnesium) */}
                          <circle cx="50" cy="50" r="22" fill="#1a1a1a" stroke="#222" strokeWidth="1" />
                          
                          {/* 2.5 Spokes (SVG Lines) - perfectly centered */}
                          <g stroke="#2a2a2a" strokeWidth="2.5" strokeLinecap="round">
                              {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(deg => {
                                  const rad = (deg * Math.PI) / 180;
                                  // Start near center, end at rim edge
                                  const x2 = 50 + 20 * Math.cos(rad);
                                  const y2 = 50 + 20 * Math.sin(rad);
                                  return <line key={deg} x1="50" y1="50" x2={x2} y2={y2} />
                              })}
                          </g>

                          {/* 2.6 Center Lock Nut (Blue for Left side/General) */}
                          <circle cx="50" cy="50" r="5" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1" />
                          <circle cx="50" cy="50" r="2" fill="#000" opacity="0.5" /> {/* Center hole */}

                          {/* 2.7 Metallic Reflection (Rotates with wheel) */}
                          <path d="M 50 28 A 22 22 0 0 1 72 50" fill="none" stroke="white" strokeWidth="1.5" opacity="0.15" strokeLinecap="round" />
                      </svg>
                   </div>
                   
                   {/* Heat Haze Effect (Static relative to container) */}
                   <div className="absolute -inset-4 rounded-full border border-f1-red/20 animate-ping opacity-30 pointer-events-none"></div>
                </div>

                {/* 3. Steps Timeline */}
                <div className="w-full max-w-md space-y-4 relative z-10">
                    {loadingSteps.map((step, index) => {
                      const isActive = index === loadingStep;
                      const isCompleted = index < loadingStep;
                      
                      return (
                        <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'scale-105 opacity-100' : 'opacity-50'}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                               isActive ? 'border-f1-teal bg-f1-teal/20 text-f1-teal shadow-[0_0_10px_#00D2BE]' : 
                               isCompleted ? 'border-f1-teal bg-f1-teal text-black' : 'border-gray-700 bg-gray-900 text-gray-600'
                           }`}>
                               {isCompleted ? (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                               ) : (
                                  <span className="text-xs font-mono">{index + 1}</span>
                               )}
                           </div>
                           <div className="flex flex-col">
                              <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                  {step.title}
                              </span>
                              {isActive && (
                                  <span className="text-[10px] text-f1-teal font-mono animate-pulse">
                                      {step.subtitle}...
                                  </span>
                              )}
                           </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {status === AnalysisStatus.ERROR && error && (
              <div className="bg-red-900/20 border border-f1-red/50 text-red-200 p-4 rounded-lg text-sm flex items-center gap-3">
                 <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 {error}
              </div>
            )}
          </div>

          {/* Bottom Section: Analysis Results - Below, Centered & Wide */}
          {analysis && (
            <div className="lg:col-span-10 lg:col-start-2 space-y-6 animate-fade-in" ref={resultsRef}>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white uppercase">{analysis.circuitName}</h2>
                  <p className="text-f1-teal text-sm font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-f1-teal animate-pulse"></span>
                      {analysis.locationGuess || "未知地點"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                  <div className="flex gap-4">
                      <div className="text-right">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wider">彎道數</span>
                      <span className="font-display text-2xl font-bold">{analysis.totalCorners}</span>
                      </div>
                      <div className="w-[1px] bg-white/10 h-10"></div>
                      <div className="text-right">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wider">車輛</span>
                      <span className="font-display text-2xl font-bold text-gray-300">{vehicle}</span>
                      </div>
                  </div>
                  {/* Export PDF Button */}
                  <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-xs font-bold text-gray-300 hover:text-white ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
                  >
                      {isExporting ? (
                          <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              匯出中...
                          </>
                      ) : (
                          <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              匯出 PDF 報告
                          </>
                      )}
                  </button>
                </div>
              </div>

              {/* Telemetry Panel (Sector Times) */}
              <TelemetryPanel stats={analysis.sectorStats} />

              {/* Strategy Panel */}
              <StrategyPanel 
                strategy={analysis.strategy} 
                overallCharacter={analysis.overallCharacter} 
                weather={weather}
                vehicle={analysis.vehicle}
              />

              {/* Corners Grid */}
              <div>
                  <h3 className="text-xl font-display font-bold text-white mb-4 border-l-4 border-f1-red pl-3">
                    彎道詳細分析 (Corner Analysis)
                  </h3>
                  {markers.length > 0 && uploadState.mediaType === 'image' && (
                    <p className="text-sm text-gray-400 mb-4 bg-white/5 p-2 rounded">
                      * 顯示順序對應圖上標記 (1 - {markers.length})
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.corners.map((corner) => (
                      <CornerCard key={corner.number} corner={corner} />
                    ))}
                  </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;