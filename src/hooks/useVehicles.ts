import { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle, VehicleWithStatus } from '@/types/vehicle';
import { API_CONFIG, getPositionsUrl } from '@/config/api';
import { getAnimatedMockVehicles } from '@/data/mockVehicles';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  const processVehicles = (data: Vehicle[]): VehicleWithStatus[] => {
    return data.map((vehicle) => ({
      ...vehicle,
      isMoving: vehicle.speed > 0,
      status: vehicle.speed > 0 ? 'moving' : 'stopped',
    }));
  };

  const fetchVehicles = useCallback(async () => {
    // Se forçar dados mockados, use-os diretamente
    if (API_CONFIG.FORCE_MOCK_DATA) {
      const mockData = getAnimatedMockVehicles();
      setVehicles(processVehicles(mockData));
      setLastUpdate(new Date());
      setIsUsingMockData(true);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(getPositionsUrl(), {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Vehicle[] = await response.json();
      
      setVehicles(processVehicles(data));
      setLastUpdate(new Date());
      setError(null);
      setIsUsingMockData(false);
      retryCountRef.current = 0;
    } catch (err) {
      console.warn('API não acessível, usando dados mockados:', err);
      
      // Incrementa contador de tentativas
      retryCountRef.current += 1;
      
      // Após algumas tentativas falhas, usa dados mockados silenciosamente
      if (retryCountRef.current >= maxRetries) {
        const mockData = getAnimatedMockVehicles();
        setVehicles(processVehicles(mockData));
        setLastUpdate(new Date());
        setIsUsingMockData(true);
        setError(null); // Não mostra erro, usa mock silenciosamente
      } else {
        // Nas primeiras tentativas, mostra erro mas continua tentando
        setError('Conectando à API...');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    
    const interval = setInterval(fetchVehicles, API_CONFIG.REFRESH_INTERVAL);
    
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
    isUsingMockData,
    refetch: fetchVehicles,
  };
}
