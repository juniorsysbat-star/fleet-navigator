import { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle, VehicleWithStatus } from '@/types/vehicle';
import { API_CONFIG, getPositionsUrl } from '@/config/api';
import { getAnimatedMockVehicles } from '@/data/mockVehicles';
 import { generateDemoVehicles, animateDemoVehicles } from '@/data/mockDemoVehicles';
 import { useAuth } from '@/contexts/AuthContext';

 export function useVehicles(forceDemoMode?: boolean) {
   // Tenta usar o contexto de auth, mas fallback para false se não estiver disponível
   let isDemoFromContext = false;
   try {
     const auth = useAuth();
     isDemoFromContext = auth.isDemoMode;
   } catch {
     // Se não estiver dentro do AuthProvider, usa o parâmetro
   }
   
   const isDemo = forceDemoMode ?? isDemoFromContext;
   
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
   const demoVehiclesRef = useRef<Vehicle[]>([]);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  const processVehicles = (data: Vehicle[], isMock: boolean = false): VehicleWithStatus[] => {
    return data.map((vehicle) => {
      // Para dados mockados, simular ignição baseado na velocidade
      const ignition = isMock ? vehicle.speed > 0 : undefined;
      const batteryLevel = isMock ? Math.floor(Math.random() * 30) + 70 : undefined;
      
      return {
        ...vehicle,
        isMoving: vehicle.speed > 0,
        status: vehicle.speed > 5 ? 'moving' : vehicle.speed > 0 ? 'idle' : 'stopped',
        ignition,
        batteryLevel,
      };
    });
  };

  const fetchVehicles = useCallback(async () => {
     // Modo demonstração: 50 veículos pelo Brasil
     if (isDemo) {
       if (demoVehiclesRef.current.length === 0) {
         demoVehiclesRef.current = generateDemoVehicles();
       } else {
         demoVehiclesRef.current = animateDemoVehicles(demoVehiclesRef.current);
       }
       setVehicles(processVehicles(demoVehiclesRef.current, true));
       setLastUpdate(new Date());
       setIsUsingMockData(true);
       setIsLoading(false);
       setError(null);
       return;
     }
 
    // Se forçar dados mockados, use-os diretamente
    if (API_CONFIG.FORCE_MOCK_DATA) {
      const mockData = getAnimatedMockVehicles();
      setVehicles(processVehicles(mockData, true));
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
      
      setVehicles(processVehicles(data, false));
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
        setVehicles(processVehicles(mockData, true));
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
   }, [isDemo]);

  useEffect(() => {
    fetchVehicles();
    
    const interval = setInterval(fetchVehicles, API_CONFIG.REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  const movingCount = vehicles.filter((v) => v.speed > 5).length;
  const stoppedCount = vehicles.filter((v) => v.speed <= 5).length;

  return {
    vehicles,
    isLoading,
    error,
    lastUpdate,
    movingCount,
    stoppedCount,
    isUsingMockData,
     isDemoMode: isDemo,
    refetch: fetchVehicles,
  };
}
