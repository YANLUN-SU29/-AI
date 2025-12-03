
export type WeatherCondition = 'Dry' | 'Wet';

export type VehicleType = 'F1' | 'FormulaE' | 'GT3' | 'Karting' | 'RoadCar';

export interface MapMarker {
  id: number;
  x: number; // percentage
  y: number; // percentage
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
}

export interface SectorStats {
  sector1: string;
  sector2: string;
  sector3: string;
  estimatedLapTime: string;
}

export interface TrackAnalysis {
  circuitName: string;
  locationGuess?: string;
  vehicle?: VehicleType; // Added field
  totalCorners: number;
  overallCharacter: string;
  corners: CornerAnalysis[];
  strategy: {
    tireWear: string;
    overtakingOpportunities: string;
    setupSuggestion: string;
  };
  sectorStats?: SectorStats;
}

export interface UploadState {
  file: File | null;
  previewUrl: string | null;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
