import { Vehicle } from '@/types/vehicle';

// ============================================
// DADOS MOCKADOS PARA DESENVOLVIMENTO
// ============================================
// Estes dados são usados quando a API não está acessível
// (ex: problemas de CORS, servidor offline, etc.)

export const MOCK_VEHICLES: Vehicle[] = [
  {
    device_id: 'mock-001',
    device_name: 'Caminhão 01',
    latitude: -23.5505,
    longitude: -46.6333,
    speed: 45.5,
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    devicetime: new Date().toISOString(),
  },
  {
    device_id: 'mock-002',
    device_name: 'Carro 02',
    latitude: -22.9068,
    longitude: -43.1729,
    speed: 0,
    address: 'Copacabana, Rio de Janeiro - RJ',
    devicetime: new Date(Date.now() - 300000).toISOString(), // 5 min atrás
  },
  {
    device_id: 'mock-003',
    device_name: 'Van 03',
    latitude: -19.9167,
    longitude: -43.9345,
    speed: 32.8,
    address: 'Praça da Liberdade, Belo Horizonte - MG',
    devicetime: new Date().toISOString(),
  },
  {
    device_id: 'mock-004',
    device_name: 'Moto 04',
    latitude: -25.4284,
    longitude: -49.2733,
    speed: 58.2,
    address: 'Centro Cívico, Curitiba - PR',
    devicetime: new Date().toISOString(),
  },
  {
    device_id: 'mock-005',
    device_name: 'Caminhonete 05',
    latitude: -30.0346,
    longitude: -51.2177,
    speed: 0,
    address: 'Moinhos de Vento, Porto Alegre - RS',
    devicetime: new Date(Date.now() - 1800000).toISOString(), // 30 min atrás
  },
];

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
