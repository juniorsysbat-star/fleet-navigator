export interface Vehicle {
  device_id: string;
  device_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  address: string;
  devicetime: string;
}

export interface VehicleWithStatus extends Vehicle {
  isMoving: boolean;
  status: 'moving' | 'stopped';
}
