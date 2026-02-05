// Mock data for AI Analytics module
 import { MOCK_DRIVERS } from './mockDrivers';
 import { MOCK_VEHICLES } from './mockVehicles';

export interface DriverScore {
  id: string;
  name: string;
  vehicleName: string;
  score: number;
  speedViolations: number;
  harshBraking: number;
  harshTurns: number;
  totalKm: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MaintenancePrediction {
  vehicleId: string;
  vehicleName: string;
  lastOilChange: Date;
  currentKm: number;
  oilChangeKm: number;
  predictedDate: Date;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  maintenanceType: string;
}

export interface FuelConsumption {
  month: string;
  fleet1: number;
  fleet2: number;
  fleet3: number;
}

 // Gera scores baseados nos motoristas reais cadastrados
 const generateDriverScores = (): DriverScore[] => {
   const scoreData = [
     { score: 95, speedViolations: 2, harshBraking: 3, harshTurns: 1, totalKm: 15420, trend: 'up' as const },
     { score: 88, speedViolations: 5, harshBraking: 8, harshTurns: 4, totalKm: 12350, trend: 'stable' as const },
     { score: 72, speedViolations: 12, harshBraking: 15, harshTurns: 8, totalKm: 18900, trend: 'down' as const },
     { score: 91, speedViolations: 4, harshBraking: 2, harshTurns: 3, totalKm: 9800, trend: 'up' as const },
     { score: 65, speedViolations: 18, harshBraking: 22, harshTurns: 12, totalKm: 21500, trend: 'down' as const },
   ];
 
   return MOCK_DRIVERS.map((driver, index) => {
     const data = scoreData[index % scoreData.length];
     const vehicle = MOCK_VEHICLES.find(v => v.device_id === driver.currentVehicleId);
     
     return {
       id: driver.id,
       name: driver.name,
       vehicleName: vehicle?.device_name || 'Não atribuído',
       score: data.score,
       speedViolations: data.speedViolations,
       harshBraking: data.harshBraking,
       harshTurns: data.harshTurns,
       totalKm: data.totalKm,
       trend: data.trend,
     };
   });
 };
 
 export const MOCK_DRIVER_SCORES: DriverScore[] = generateDriverScores();

export const MOCK_MAINTENANCE_PREDICTIONS: MaintenancePrediction[] = [
  {
    vehicleId: 'mock-001',
    vehicleName: 'Caminhão 01',
    lastOilChange: new Date('2024-11-15'),
    currentKm: 148500,
    oilChangeKm: 150000,
    predictedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    urgency: 'high',
    maintenanceType: 'Troca de Óleo',
  },
  {
    vehicleId: 'mock-003',
    vehicleName: 'Van 03',
    lastOilChange: new Date('2024-10-20'),
    currentKm: 87200,
    oilChangeKm: 90000,
    predictedDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    urgency: 'medium',
    maintenanceType: 'Troca de Óleo',
  },
  {
    vehicleId: 'mock-002',
    vehicleName: 'Carro 02',
    lastOilChange: new Date('2024-12-01'),
    currentKm: 45800,
    oilChangeKm: 55000,
    predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    urgency: 'low',
    maintenanceType: 'Troca de Óleo',
  },
  {
    vehicleId: 'mock-004',
    vehicleName: 'Moto 04',
    lastOilChange: new Date('2024-09-10'),
    currentKm: 29800,
    oilChangeKm: 30000,
    predictedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    urgency: 'critical',
    maintenanceType: 'Troca de Óleo',
  },
];

export const MOCK_FUEL_CONSUMPTION: FuelConsumption[] = [
  { month: 'Jul', fleet1: 2400, fleet2: 1800, fleet3: 2100 },
  { month: 'Ago', fleet1: 2200, fleet2: 1900, fleet3: 2300 },
  { month: 'Set', fleet1: 2500, fleet2: 1700, fleet3: 2000 },
  { month: 'Out', fleet1: 2100, fleet2: 2000, fleet3: 2400 },
  { month: 'Nov', fleet1: 2300, fleet2: 1850, fleet3: 2200 },
  { month: 'Dez', fleet1: 2000, fleet2: 1950, fleet3: 2100 },
];

export const ANALYTICS_SUMMARY = {
  totalDrivers: 5,
  averageScore: 82.2,
  totalKmThisMonth: 78000,
  fuelSavedLiters: 1250,
  co2ReductionKg: 2890,
  alertsThisWeek: 12,
};
