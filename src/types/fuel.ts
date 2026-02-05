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

// Fuel type labels
export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diesel',
  ethanol: 'Etanol',
};

// Helper to calculate metrics from fuel records
export const calculateFuelMetrics = (records: FuelRecord[]) => {
  if (records.length === 0) return null;
  
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const totalCost = records.reduce((sum, r) => sum + r.totalCost, 0);
  const totalKm = records.reduce((sum, r) => sum + (r.kmSinceLastFill || 0), 0);
  
  const avgKmPerLiter = totalKm > 0 ? totalKm / totalLiters : 0;
  const avgCostPerKm = totalKm > 0 ? totalCost / totalKm : 0;
  
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
