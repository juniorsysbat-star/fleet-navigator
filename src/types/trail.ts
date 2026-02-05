export interface TrailPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
  isStop: boolean;
  stopDuration?: number; // minutes
}
