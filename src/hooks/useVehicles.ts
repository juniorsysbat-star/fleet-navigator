import { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle, VehicleWithStatus } from '@/types/vehicle';
import { API_CONFIG, getPositionsUrl } from '@/config/api';
import { getAnimatedMockVehicles } from '@/data/mockVehicles';
 import { generateDemoVehicles, animateDemoVehicles } from '@/data/mockDemoVehicles';
 import { useAuth } from '@/contexts/AuthContext';
import { DeviceFormData } from '@/components/admin/DeviceModal';

 export function useVehicles(forceDemoMode?: boolean) {
   // Tenta usar o contexto de auth, mas fallback para false se não estiver disponível
   let isDemoFromContext = false;
  let loginDemoFn: (() => void) | null = null;
   try {
     const auth = useAuth();
     isDemoFromContext = auth.isDemoMode;
    loginDemoFn = auth.loginDemo;
   } catch {
     // Se não estiver dentro do AuthProvider, usa o parâmetro
   }
   
   const isDemo = forceDemoMode ?? isDemoFromContext;
   
  // Inicializa com dados mock para liberar tela imediatamente
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>(() => {
    const initialMock = getAnimatedMockVehicles();
    return initialMock.map(v => ({
      ...v,
      isMoving: v.speed > 0,
      status: v.speed > 5 ? 'moving' as const : v.speed > 0 ? 'idle' as const : 'stopped' as const,
      ignition: v.speed > 0,
      batteryLevel: Math.floor(Math.random() * 30) + 70,
    }));
  });
  const [isLoading, setIsLoading] = useState(false); // Começa false - tela liberada imediatamente
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(true); // Assume mock até API responder
   const demoVehiclesRef = useRef<Vehicle[]>([]);
  const retryCountRef = useRef(0);
  const hasTriedApiRef = useRef(false);
  const autoFallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

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
 
    // Se forçar dados mockados ou já falhou antes, use-os diretamente
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
      // Timeout reduzido para 3 segundos - libera rápido
      const timeoutId = setTimeout(() => controller.abort(), 3000);

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
      hasTriedApiRef.current = true;
    } catch (err) {
      // Log silencioso - não alarma o usuário
      if (!hasTriedApiRef.current) {
        console.info('API não disponível, usando dados de demonstração:', err);
      }
      
      hasTriedApiRef.current = true;
      
      // Fallback silencioso para mock data
      const mockData = getAnimatedMockVehicles();
      setVehicles(processVehicles(mockData, true));
      setLastUpdate(new Date());
      setIsUsingMockData(true);
      setError(null); // Nunca mostra erro - usa mock silenciosamente
      
      // Se não há usuário logado e API falhou, entra em modo demo automaticamente
      if (loginDemoFn && !isDemoFromContext) {
        // Aguarda um momento e ativa modo demo se continuar sem usuário
        if (!autoFallbackTimerRef.current) {
          autoFallbackTimerRef.current = setTimeout(() => {
            if (!hasTriedApiRef.current || retryCountRef.current > 1) {
              console.info('Ativando modo demonstração automaticamente');
              loginDemoFn?.();
            }
          }, 3000);
        }
      }
    } finally {
      setIsLoading(false);
    }
   }, [isDemo, isDemoFromContext, loginDemoFn]);

  useEffect(() => {
    // Limpa timer ao desmontar
    return () => {
      if (autoFallbackTimerRef.current) {
        clearTimeout(autoFallbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchVehicles();
    
    const interval = setInterval(fetchVehicles, API_CONFIG.REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  const movingCount = vehicles.filter((v) => v.speed > 5).length;
  const stoppedCount = vehicles.filter((v) => v.speed <= 5).length;

  // Update vehicle in local state (for demo mode persistence)
  const updateVehicle = useCallback((device: DeviceFormData) => {
    setVehicles(prev => prev.map(v => {
      if (v.device_id === device.id) {
        return {
          ...v,
          device_name: device.plate || device.name,
          vehicleType: device.vehicleType,
          iconColor: device.iconColor,
          documentation: {
            ipvaExpiry: device.ipvaExpiry,
            insuranceExpiry: device.insuranceExpiry,
            licensingExpiry: device.licensingExpiry,
            trailers: device.trailers,
          },
        };
      }
      return v;
    }));
  }, []);

  // Add new vehicle to local state (for demo mode persistence)
  const addVehicle = useCallback((device: DeviceFormData) => {
    const newVehicle: VehicleWithStatus = {
      device_id: device.imei || `demo-${Date.now()}`,
      device_name: device.plate || device.name,
      latitude: -23.5505 + (Math.random() - 0.5) * 2,
      longitude: -46.6333 + (Math.random() - 0.5) * 2,
      speed: 0,
      address: 'Endereço será atualizado automaticamente',
      devicetime: new Date().toISOString(),
      vehicleType: device.vehicleType,
      iconColor: device.iconColor,
      documentation: {
        ipvaExpiry: device.ipvaExpiry,
        insuranceExpiry: device.insuranceExpiry,
        licensingExpiry: device.licensingExpiry,
        trailers: device.trailers,
      },
      isMoving: false,
      status: 'stopped',
      ignition: false,
      batteryLevel: 100,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  }, []);

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
    updateVehicle,
    addVehicle,
  };
}
