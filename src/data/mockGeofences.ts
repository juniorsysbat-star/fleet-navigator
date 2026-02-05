// Geofence types and mock data

export interface Geofence {
  id: string;
  name: string;
  type: 'polygon' | 'circle';
  coordinates: { lat: number; lng: number }[];
  radius?: number; // for circles, in meters
  center?: { lat: number; lng: number }; // for circles
  color: string;
  isActive: boolean;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  createdAt: Date;
}

export const MOCK_GEOFENCES: Geofence[] = [
  {
    id: 'geo-001',
    name: 'Garagem Principal',
    type: 'polygon',
    coordinates: [
      { lat: -23.5515, lng: -46.6343 },
      { lat: -23.5515, lng: -46.6323 },
      { lat: -23.5495, lng: -46.6323 },
      { lat: -23.5495, lng: -46.6343 },
    ],
    color: '#00ff88',
    isActive: true,
    alertOnEnter: true,
    alertOnExit: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'geo-002',
    name: 'Zona de Risco - Centro',
    type: 'polygon',
    coordinates: [
      { lat: -23.5455, lng: -46.6380 },
      { lat: -23.5455, lng: -46.6340 },
      { lat: -23.5420, lng: -46.6340 },
      { lat: -23.5420, lng: -46.6380 },
    ],
    color: '#ff4444',
    isActive: true,
    alertOnEnter: true,
    alertOnExit: false,
    createdAt: new Date('2025-01-10'),
  },
  {
    id: 'geo-003',
    name: 'Área de Entrega',
    type: 'polygon',
    coordinates: [
      { lat: -23.5580, lng: -46.6450 },
      { lat: -23.5580, lng: -46.6400 },
      { lat: -23.5550, lng: -46.6400 },
      { lat: -23.5550, lng: -46.6450 },
    ],
    color: '#00bfff',
    isActive: false,
    alertOnEnter: false,
    alertOnExit: true,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'geo-004',
    name: 'Ponto de Coleta',
    type: 'circle',
    coordinates: [],
    center: { lat: -23.5600, lng: -46.6500 },
    radius: 300,
    color: '#ff9900',
    isActive: true,
    alertOnEnter: true,
    alertOnExit: false,
    createdAt: new Date('2025-01-20'),
  },
];
