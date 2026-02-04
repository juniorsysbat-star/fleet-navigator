export interface Vehicle {
  device_id: string;
  device_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  address: string;
  devicetime: string;
}

export type VehicleStatus = 'moving' | 'stopped' | 'idle' | 'offline' | 'unknown';

export interface VehicleWithStatus extends Vehicle {
  isMoving: boolean;
  status: VehicleStatus;
  ignition?: boolean;
  batteryLevel?: number;
  historyTrail?: { lat: number; lng: number }[];
}
