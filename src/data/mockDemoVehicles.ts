 import { Vehicle, VehicleType } from '@/types/vehicle';
 
 // Cidades brasileiras para distribuir os veículos demo
 const BRAZIL_CITIES = [
   { name: 'São Paulo - SP', lat: -23.5505, lng: -46.6333 },
   { name: 'Rio de Janeiro - RJ', lat: -22.9068, lng: -43.1729 },
   { name: 'Belo Horizonte - MG', lat: -19.9167, lng: -43.9345 },
   { name: 'Curitiba - PR', lat: -25.4284, lng: -49.2733 },
   { name: 'Porto Alegre - RS', lat: -30.0346, lng: -51.2177 },
   { name: 'Brasília - DF', lat: -15.7942, lng: -47.8825 },
   { name: 'Salvador - BA', lat: -12.9714, lng: -38.5014 },
   { name: 'Fortaleza - CE', lat: -3.7172, lng: -38.5433 },
   { name: 'Recife - PE', lat: -8.0476, lng: -34.8770 },
   { name: 'Manaus - AM', lat: -3.1190, lng: -60.0217 },
   { name: 'Goiânia - GO', lat: -16.6869, lng: -49.2648 },
   { name: 'Campinas - SP', lat: -22.9099, lng: -47.0626 },
   { name: 'Vitória - ES', lat: -20.3155, lng: -40.3128 },
   { name: 'Florianópolis - SC', lat: -27.5954, lng: -48.5480 },
   { name: 'Natal - RN', lat: -5.7945, lng: -35.2110 },
 ];
 
 const VEHICLE_TYPES: VehicleType[] = ['sedan', 'truck', 'pickup', 'motorcycle', 'bus'];
 const VEHICLE_NAMES = ['Caminhão', 'Van', 'Carro', 'Moto', 'Ônibus', 'Pickup', 'Furgão'];
 
 // Gera 50 veículos demo distribuídos pelo Brasil
 export function generateDemoVehicles(): Vehicle[] {
   const vehicles: Vehicle[] = [];
 
  // Veículo de ALERTA - Bloqueado (aparece vermelho)
  vehicles.push({
    device_id: 'demo-alert-001',
    device_name: '🚨 VEÍCULO BLOQUEADO',
    latitude: -23.5605,
    longitude: -46.6533,
    speed: 0,
    address: 'São Paulo - SP (BLOQUEADO)',
    devicetime: new Date().toISOString(),
    vehicleType: 'truck',
    iconColor: 'status',
    blocked: true,
  } as Vehicle & { blocked: boolean });

  // Veículo de ALERTA - SOS Ativo (aparece vermelho)
  vehicles.push({
    device_id: 'demo-alert-002',
    device_name: '🆘 CAMINHÃO SOS',
    latitude: -22.9168,
    longitude: -43.1829,
    speed: 45,
    address: 'Rio de Janeiro - RJ (SOS ATIVO)',
    devicetime: new Date().toISOString(),
    vehicleType: 'truck',
    iconColor: 'status',
    alarm: 'SOS',
  } as Vehicle & { alarm: string });

  // Veículo de ALERTA - Violação (ignição OFF + movimento = guincho)
  vehicles.push({
    device_id: 'demo-alert-003',
    device_name: '⚠️ POSSÍVEL GUINCHO',
    latitude: -19.9267,
    longitude: -43.9445,
    speed: 35,
    address: 'Belo Horizonte - MG (VIOLAÇÃO)',
    devicetime: new Date().toISOString(),
    vehicleType: 'sedan',
    iconColor: 'status',
    ignition: false,
  } as Vehicle & { ignition: boolean });

   for (let i = 1; i <= 50; i++) {
     const city = BRAZIL_CITIES[Math.floor(Math.random() * BRAZIL_CITIES.length)];
     const type = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
     const namePart = VEHICLE_NAMES[Math.floor(Math.random() * VEHICLE_NAMES.length)];
     const isMoving = Math.random() > 0.3; // 70% em movimento
     const speed = isMoving ? Math.floor(Math.random() * 80) + 20 : 0;
 
     // Variação de posição dentro da cidade
     const latVariation = (Math.random() - 0.5) * 0.1;
     const lngVariation = (Math.random() - 0.5) * 0.1;
 
     vehicles.push({
       device_id: `demo-${i.toString().padStart(3, '0')}`,
       device_name: `${namePart} ${i.toString().padStart(2, '0')}`,
       latitude: city.lat + latVariation,
       longitude: city.lng + lngVariation,
       speed: speed,
       address: city.name,
       devicetime: new Date(Date.now() - Math.random() * 600000).toISOString(),
       vehicleType: type,
       iconColor: 'status',
     });
   }
 
   return vehicles;
 }
 
 // Simula movimento dos veículos demo
 export function animateDemoVehicles(vehicles: Vehicle[]): Vehicle[] {
   return vehicles.map((vehicle) => {
     if (vehicle.speed > 0) {
       // Movimento suave na direção atual
       const direction = Math.random() * Math.PI * 2;
       const distance = 0.0005 + Math.random() * 0.001;
       
       return {
         ...vehicle,
         latitude: vehicle.latitude + Math.cos(direction) * distance,
         longitude: vehicle.longitude + Math.sin(direction) * distance,
         speed: Math.max(10, vehicle.speed + (Math.random() - 0.5) * 20),
         devicetime: new Date().toISOString(),
       };
     }
     
     // 5% chance de começar a se mover
     if (Math.random() < 0.05) {
       return {
         ...vehicle,
         speed: Math.floor(Math.random() * 40) + 20,
         ignition: true,
         devicetime: new Date().toISOString(),
       };
     }
     
     return vehicle;
   });
 }
 
 // Dados de analytics enriquecidos para demo
 export const DEMO_ANALYTICS = {
   totalDrivers: 50,
   averageScore: 87,
   totalKmThisMonth: 245000,
   fuelSavedLiters: 3200,
   co2ReductionKg: 8500,
   alertsThisWeek: 42,
   violations: {
     speeding: 156,
     harshBraking: 89,
     harshAcceleration: 67,
     idling: 203,
   },
   trends: {
     kmPerDay: [850, 920, 780, 1050, 890, 1120, 980, 1200, 1050, 950, 1100, 870, 1250, 1080],
     fuelPerDay: [320, 350, 290, 380, 340, 410, 360, 440, 390, 350, 400, 320, 460, 400],
     alertsPerDay: [5, 8, 3, 12, 6, 9, 4, 7, 11, 5, 8, 6, 10, 7],
   },
 };
 
 // Dados financeiros demo
 export const DEMO_BILLING = {
   totalRevenue: 185000,
   projectedRevenue: 210000,
   totalClients: 48,
   overdueClients: 5,
   overdueAmount: 12500,
   delinquencyRate: 10.4,
   newClientsThisMonth: 8,
 };