 // Mock data for Fuel Records module
 
 export type FuelType = 'gasoline' | 'diesel' | 'ethanol';
 
 export interface FuelRecord {
   id: string;
   vehicleId: string;
   vehicleName: string;
   date: Date;
   odometer: number;
   liters: number;
   pricePerLiter: number;
   totalCost: number;
   fuelType: FuelType;
   station?: string;
   photoUrl?: string;
   kmSinceLastFill?: number;
   kmPerLiter?: number;
   costPerKm?: number;
 }
 
 // 5 mock fuel records with realistic data
 export const MOCK_FUEL_RECORDS: FuelRecord[] = [
   {
     id: 'fuel-001',
     vehicleId: 'mock-001',
     vehicleName: 'Caminhão 01',
     date: new Date('2025-01-05T08:30:00'),
     odometer: 145000,
     liters: 120,
     pricePerLiter: 5.89,
     totalCost: 706.80,
     fuelType: 'diesel',
     station: 'Posto Shell - Av. Paulista',
     kmSinceLastFill: 480,
     kmPerLiter: 4.0,
     costPerKm: 1.47,
   },
   {
     id: 'fuel-002',
     vehicleId: 'mock-002',
     vehicleName: 'Carro 02',
     date: new Date('2025-01-10T14:15:00'),
     odometer: 42500,
     liters: 45,
     pricePerLiter: 5.99,
     totalCost: 269.55,
     fuelType: 'gasoline',
     station: 'Posto Ipiranga - Copacabana',
     kmSinceLastFill: 540,
     kmPerLiter: 12.0,
     costPerKm: 0.50,
   },
   {
     id: 'fuel-003',
     vehicleId: 'mock-003',
     vehicleName: 'Van 03',
     date: new Date('2025-01-15T10:45:00'),
     odometer: 85200,
     liters: 65,
     pricePerLiter: 5.79,
     totalCost: 376.35,
     fuelType: 'diesel',
     station: 'Posto BR - Praça da Liberdade',
     kmSinceLastFill: 455,
     kmPerLiter: 7.0,
     costPerKm: 0.83,
   },
   {
     id: 'fuel-004',
     vehicleId: 'mock-004',
     vehicleName: 'Moto 04',
     date: new Date('2025-01-20T16:20:00'),
     odometer: 28900,
     liters: 12,
     pricePerLiter: 5.49,
     totalCost: 65.88,
     fuelType: 'ethanol',
     station: 'Posto Texaco - Centro Curitiba',
     kmSinceLastFill: 180,
     kmPerLiter: 15.0,
     costPerKm: 0.37,
   },
   {
     id: 'fuel-005',
     vehicleId: 'mock-005',
     vehicleName: 'Caminhonete 05',
     date: new Date('2025-01-25T09:00:00'),
     odometer: 62800,
     liters: 75,
     pricePerLiter: 5.69,
     totalCost: 426.75,
     fuelType: 'gasoline',
     station: 'Posto Shell - Moinhos de Vento',
     kmSinceLastFill: 525,
     kmPerLiter: 7.0,
     costPerKm: 0.81,
   },
 ];
 
 // Helper to calculate metrics from fuel records
 export const calculateFuelMetrics = (records: FuelRecord[]) => {
   if (records.length === 0) return null;
   
   const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
   const totalCost = records.reduce((sum, r) => sum + r.totalCost, 0);
   const totalKm = records.reduce((sum, r) => sum + (r.kmSinceLastFill || 0), 0);
   
   const avgKmPerLiter = totalKm / totalLiters;
   const avgCostPerKm = totalCost / totalKm;
   
   return {
     totalLiters,
     totalCost,
     totalKm,
     avgKmPerLiter: Number(avgKmPerLiter.toFixed(2)),
     avgCostPerKm: Number(avgCostPerKm.toFixed(2)),
     recordCount: records.length,
   };
 };
 
 // Get consumption trend data for line chart
 export const getConsumptionTrend = (records: FuelRecord[]) => {
   return records
     .filter(r => r.kmPerLiter !== undefined)
     .sort((a, b) => a.date.getTime() - b.date.getTime())
     .map(r => ({
       date: r.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
       kmPerLiter: r.kmPerLiter,
       vehicleName: r.vehicleName,
     }));
 };
 
 // Get cost per vehicle for pie chart
 export const getCostByVehicle = (records: FuelRecord[]) => {
   const costMap = new Map<string, { name: string; value: number }>();
   
   records.forEach(r => {
     const existing = costMap.get(r.vehicleId);
     if (existing) {
       existing.value += r.totalCost;
     } else {
       costMap.set(r.vehicleId, { name: r.vehicleName, value: r.totalCost });
     }
   });
   
   return Array.from(costMap.values()).map(item => ({
     ...item,
     value: Number(item.value.toFixed(2)),
   }));
 };
 
 // Get cost per km trend
 export const getCostPerKmTrend = (records: FuelRecord[]) => {
   return records
     .filter(r => r.costPerKm !== undefined)
     .sort((a, b) => a.date.getTime() - b.date.getTime())
     .map(r => ({
       date: r.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
       costPerKm: r.costPerKm,
       vehicleName: r.vehicleName,
     }));
 };
 
 // Fuel type labels
 export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
   gasoline: 'Gasolina',
   diesel: 'Diesel',
   ethanol: 'Etanol',
 };