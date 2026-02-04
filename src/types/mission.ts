export interface MissionWaypoint {
  lat: number;
  lng: number;
  name: string;
}

export interface Mission {
  id: string;
  name: string;
  origin: MissionWaypoint;
  destination: MissionWaypoint;
  vehicleId: string;
  maxSpeed: number;
  corridorWidth: number; // in meters
  routeCoordinates: { lat: number; lng: number }[];
  distance: number; // in meters
  duration: number; // in seconds
  status: 'active' | 'completed' | 'paused' | 'deviation';
  createdAt: Date;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  coordinates: { lat: number; lng: number }[];
}
