

export type WeatherCondition = 'Dry' | 'Wet';

export type VehicleType = 'F1' | 'FormulaE' | 'GT3' | 'Karting' | 'RoadCar';

export type VideoAnalysisMode = 'FullLap' | 'KeyCorners' | 'SpecificSection';

export interface MapMarker {
  id: number;
  x: number; // percentage
  y: number; // percentage
}

export interface WayPoint {
  x: number;
  y: number;
}

export interface StartConfig {
  x: number; // percentage
  y: number; // percentage
  angle: number; // degrees
}

export interface CornerAnalysis {
  number: number;
  name?: string;
  type: string; // e.g., Hairpin, Chicane, High-speed
  brakingZone: 'Heavy' | 'Medium' | 'Light' | 'Lift' | 'Flat-out';
  difficulty: number; // 1-10
  advice: string;
  gear?: number;
  racingLineSVG?: string; // Abstract SVG path d attribute for visualization
}

export interface SetupItem {
  component: string; // e.g., "Front Wing", "Tire Pressure"
  value: string;     // e.g., "24-26", "2.1"
  unit?: string;     // e.g., "deg", "bar", "N/mm"
  trend: 'Soft' | 'Medium' | 'Stiff' | 'Low' | 'High' | 'Balanced'; // For visual color coding
}

export interface SectorDetail {
  time: string;       // e.g., "32.5s"
  description: string; // e.g., "High speed straight into tight chicane"
}

export interface SectorStats {
  sector1: SectorDetail;
  sector2: SectorDetail;
  sector3: SectorDetail;
  estimatedLapTime: string;
}

export interface TrackAnalysis {
  circuitName: string;
  locationGuess?: string;
  vehicle?: VehicleType; 
  totalCorners: number;
  overallCharacter: string;
  corners: CornerAnalysis[];
  strategy: {
    tireWear: string;
    keyToWin: string; // New: Winning strategy summary
    aeroStrategy: string; // Dedicated aero advice
    pitStrategy: string; // New: Pit stop strategy advice
    overtakingOpportunities: string;
    setupSuggestion: string; // General mechanical/suspension summary
    detailedSetup?: SetupItem[]; // Structured visual data
  };
  sectorStats?: SectorStats;
}

export interface UploadState {
  file: File | null;
  previewUrl: string | null;
  mediaType: 'image' | 'video';
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}