import { useState, useEffect, useCallback } from 'react';
import { Vehicle, VehicleWithStatus } from '@/types/vehicle';

const API_URL = 'http://84.46.255.106:3000/api/positions';
const REFRESH_INTERVAL = 10000; // 10 seconds

export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Vehicle[] = await response.json();
      
      const vehiclesWithStatus: VehicleWithStatus[] = data.map((vehicle) => ({
        ...vehicle,
        isMoving: vehicle.speed > 0,
        status: vehicle.speed > 0 ? 'moving' : 'stopped',
      }));
      
      setVehicles(vehiclesWithStatus);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    
    const interval = setInterval(fetchVehicles, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  const movingCount = vehicles.filter((v) => v.isMoving).length;
  const stoppedCount = vehicles.filter((v) => !v.isMoving).length;

  return {
    vehicles,
    isLoading,
    error,
    lastUpdate,
    movingCount,
    stoppedCount,
    refetch: fetchVehicles,
  };
}
