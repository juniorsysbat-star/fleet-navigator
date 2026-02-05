export interface Geofence {
  id: string;
  name: string;
  type: 'polygon' | 'circle';
  coordinates: { lat: number; lng: number }[];
  center?: { lat: number; lng: number };
  radius?: number;
  color: string;
  isActive: boolean;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  createdAt: Date;
}
