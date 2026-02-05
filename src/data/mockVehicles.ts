import { Vehicle, VehicleType } from '@/types/vehicle';

// ============================================
// DADOS MOCKADOS PARA DESENVOLVIMENTO
// ============================================
// Estes dados são usados quando a API não está acessível
// (ex: problemas de CORS, servidor offline, etc.)

export const MOCK_VEHICLES: Vehicle[] = [
  {
    device_id: 'mock-001',
    device_name: '🚨 Caminhão 01 (BLOQUEADO)',
    latitude: -23.5505,
    longitude: -46.6333,
    speed: 45.5,
    address: 'ALERTA: Veículo Bloqueado - Av. Paulista, São Paulo - SP',
    devicetime: new Date().toISOString(),
    vehicleType: 'truck' as VehicleType,
    iconColor: '#3b82f6',
    blocked: true,
    alarm: 'Bloqueio ativo',
  },
  {
    device_id: 'mock-002',
    device_name: '🆘 Carro 02 (SOS)',
    latitude: -22.9068,
    longitude: -43.1729,
    speed: 35,
    address: 'ALERTA SOS ATIVO - Copacabana, Rio de Janeiro - RJ',
    devicetime: new Date(Date.now() - 300000).toISOString(), // 5 min atrás
    vehicleType: 'sedan' as VehicleType,
    iconColor: 'status',
    alarm: 'SOS',
  },
  {
    device_id: 'mock-003',
    device_name: 'Van 03',
    latitude: -19.9167,
    longitude: -43.9345,
    speed: 32.8,
    address: 'Praça da Liberdade, Belo Horizonte - MG',
    devicetime: new Date().toISOString(),
    vehicleType: 'pickup' as VehicleType,
    iconColor: '#f97316',
  },
  {
    device_id: 'mock-004',
    device_name: 'Moto 04',
    latitude: -25.4284,
    longitude: -49.2733,
    speed: 58.2,
    address: 'Centro Cívico, Curitiba - PR',
    devicetime: new Date().toISOString(),
    vehicleType: 'motorcycle' as VehicleType,
    iconColor: '#fbbf24',
  },
  {
    device_id: 'mock-005',
    device_name: 'Caminhonete 05',
    latitude: -30.0346,
    longitude: -51.2177,
    speed: 0,
    address: 'Moinhos de Vento, Porto Alegre - RS',
    devicetime: new Date(Date.now() - 1800000).toISOString(), // 30 min atrás
    vehicleType: 'pickup' as VehicleType,
    iconColor: 'status',
  },
];

// Histórico de trajeto mockado para cada veículo
export const MOCK_TRAILS: Record<string, { lat: number; lng: number }[]> = {
  'mock-001': [
    { lat: -23.5605, lng: -46.6433 },
    { lat: -23.5585, lng: -46.6403 },
    { lat: -23.5565, lng: -46.6373 },
    { lat: -23.5545, lng: -46.6353 },
    { lat: -23.5525, lng: -46.6343 },
    { lat: -23.5505, lng: -46.6333 },
  ],
  'mock-002': [
    { lat: -22.9168, lng: -43.1829 },
    { lat: -22.9148, lng: -43.1799 },
    { lat: -22.9118, lng: -43.1769 },
    { lat: -22.9088, lng: -43.1749 },
    { lat: -22.9068, lng: -43.1729 },
  ],
  'mock-003': [
    { lat: -19.9267, lng: -43.9445 },
    { lat: -19.9237, lng: -43.9415 },
    { lat: -19.9207, lng: -43.9385 },
    { lat: -19.9187, lng: -43.9365 },
    { lat: -19.9167, lng: -43.9345 },
  ],
  'mock-004': [
    { lat: -25.4384, lng: -49.2833 },
    { lat: -25.4354, lng: -49.2803 },
    { lat: -25.4334, lng: -49.2773 },
    { lat: -25.4314, lng: -49.2753 },
    { lat: -25.4284, lng: -49.2733 },
  ],
  'mock-005': [
    { lat: -30.0446, lng: -51.2277 },
    { lat: -30.0416, lng: -51.2247 },
    { lat: -30.0386, lng: -51.2217 },
    { lat: -30.0366, lng: -51.2197 },
    { lat: -30.0346, lng: -51.2177 },
  ],
};

// Simula movimento aleatório para tornar os dados mockados mais realistas
export const getAnimatedMockVehicles = (): Vehicle[] => {
  return MOCK_VEHICLES.map((vehicle) => ({
    ...vehicle,
    // Pequena variação na velocidade para veículos em movimento
    speed: vehicle.speed > 0 
      ? Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10)
      : 0,
    // Pequena variação na posição para veículos em movimento
    latitude: vehicle.speed > 0 
      ? vehicle.latitude + (Math.random() - 0.5) * 0.001
      : vehicle.latitude,
    longitude: vehicle.speed > 0
      ? vehicle.longitude + (Math.random() - 0.5) * 0.001
      : vehicle.longitude,
    devicetime: new Date().toISOString(),
  }));
};

// Gera um trajeto mockado dinamicamente baseado na posição atual
export const generateMockTrail = (
  currentLat: number, 
  currentLng: number, 
  pointCount: number = 8
): { lat: number; lng: number }[] => {
  const trail: { lat: number; lng: number }[] = [];
  let lat = currentLat + 0.015;
  let lng = currentLng + 0.015;
  
  for (let i = 0; i < pointCount; i++) {
    trail.push({ lat, lng });
    lat -= 0.002 + Math.random() * 0.001;
    lng -= 0.002 + Math.random() * 0.001;
  }
  
  // Adiciona posição atual como último ponto
  trail.push({ lat: currentLat, lng: currentLng });
  
  return trail;
};

