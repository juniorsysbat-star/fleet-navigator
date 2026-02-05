export type VehicleType = 'sedan' | 'motorcycle' | 'truck' | 'pickup' | 'tractor' | 'bus';

export type TrailerType = 'bau' | 'sider' | 'graneleiro' | 'tanque' | 'cegonha' | 'prancha';

export interface Trailer {
  id: string;
  plate: string;
  type: TrailerType;
  documentExpiry: string;
  notes?: string;
}

export interface VehicleDocumentation {
  ipvaExpiry?: string;
  insuranceExpiry?: string;
  licensingExpiry?: string;
  trailers?: Trailer[];
}

export interface Vehicle {
  device_id: string;
  device_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  address: string;
  devicetime: string;
  vehicleType?: VehicleType;
  iconColor?: string;
  documentation?: VehicleDocumentation;
}

export type VehicleStatus = 'moving' | 'stopped' | 'idle' | 'offline' | 'unknown';

export interface VehicleWithStatus extends Vehicle {
  isMoving: boolean;
  status: VehicleStatus;
  ignition?: boolean;
  batteryLevel?: number;
  historyTrail?: { lat: number; lng: number }[];
}
