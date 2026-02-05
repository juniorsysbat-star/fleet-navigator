import { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle, VehicleWithStatus } from '@/types/vehicle';
 import { API_CONFIG } from '@/config/api';
import { getAnimatedMockVehicles } from '@/data/mockVehicles';
 import { generateDemoVehicles, animateDemoVehicles } from '@/data/mockDemoVehicles';
 import { useAuth } from '@/contexts/AuthContext';
import type { DeviceFormData } from '@/components/admin/DeviceModal';
 import { fetchVehiclesFromApi, NormalizedVehicle } from '@/services/apiService';
 import { onVehicleUpdate, isSocketConnected } from '@/services/socketService';

 export function useVehicles(forceDemoMode?: boolean) {
   // Tenta usar o contexto de auth, mas fallback para false se não estiver disponível
   let isDemoFromContext = false;
  let loginDemoFn: (() => void) | null = null;
  let isApiConnectedFromContext = false;
   try {
     const auth = useAuth();
     isDemoFromContext = auth.isDemoMode;
    loginDemoFn = auth.loginDemo;
    isApiConnectedFromContext = auth.isApiConnected;
   } catch {
     // Se não estiver dentro do AuthProvider, usa o parâmetro
   }
   
   const isDemo = forceDemoMode ?? isDemoFromContext;

   // Fontes de dados mock para persistência durante a sessão
   const demoVehiclesRef = useRef<Vehicle[]>([]);
   const mockVehiclesRef = useRef<Vehicle[]>([]);
   
  // Inicializa com dados mock para liberar tela imediatamente
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>(() => {
    const initialMock = getAnimatedMockVehicles();
     // Mantém base mock para permitir CRUD durante a sessão (sem sobrescrever em refresh)
     mockVehiclesRef.current = initialMock;
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
  const retryCountRef = useRef(0);
  const hasTriedApiRef = useRef(false);
  const autoFallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketCleanupRef = useRef<(() => void) | null>(null);

   const animateLocalMockVehicles = useCallback((list: Vehicle[]): Vehicle[] => {
     return list.map((vehicle) => ({
       ...vehicle,
       speed: vehicle.speed > 0
         ? Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10)
         : 0,
       latitude: vehicle.speed > 0
         ? vehicle.latitude + (Math.random() - 0.5) * 0.001
         : vehicle.latitude,
       longitude: vehicle.speed > 0
         ? vehicle.longitude + (Math.random() - 0.5) * 0.001
         : vehicle.longitude,
       devicetime: new Date().toISOString(),
     }));
   }, []);

  const processVehicles = (data: Vehicle[], isMock: boolean = false): VehicleWithStatus[] => {
    return data.map((vehicle) => {
      // Para dados mockados, simular ignição baseado na velocidade
      // Except for alert vehicles that might have ignition OFF with speed > 0 (violation)
      const extendedVehicle = vehicle as Vehicle & { blocked?: boolean; alarm?: string | null; ignition?: boolean };
      const ignition = extendedVehicle.ignition !== undefined 
        ? extendedVehicle.ignition 
        : (isMock ? vehicle.speed > 0 : undefined);
      const batteryLevel = isMock ? Math.floor(Math.random() * 30) + 70 : undefined;
      
      return {
        ...vehicle,
        isMoving: vehicle.speed > 0,
        status: vehicle.speed > 5 ? 'moving' : vehicle.speed > 0 ? 'idle' : 'stopped',
        ignition,
        batteryLevel,
        blocked: extendedVehicle.blocked,
        alarm: extendedVehicle.alarm,
      };
    });
  };

  // Converte NormalizedVehicle para Vehicle
  const normalizedToVehicle = (nv: NormalizedVehicle): Vehicle => ({
    device_id: nv.device_id,
    device_name: nv.device_name,
    latitude: nv.latitude,
    longitude: nv.longitude,
    speed: nv.speed,
    address: nv.address,
    devicetime: nv.devicetime,
  });

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
      if (mockVehiclesRef.current.length === 0) {
        mockVehiclesRef.current = getAnimatedMockVehicles();
      } else {
        mockVehiclesRef.current = animateLocalMockVehicles(mockVehiclesRef.current);
      }
      setVehicles(processVehicles(mockVehiclesRef.current, true));
      setLastUpdate(new Date());
      setIsUsingMockData(true);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
       // Usa o novo serviço de API com mapeamento automático
       const normalizedData = await fetchVehiclesFromApi();
       const data: Vehicle[] = normalizedData.map(normalizedToVehicle);
      
      setVehicles(processVehicles(data, false));
      setLastUpdate(new Date());
      setError(null);
      setIsUsingMockData(false);
      hasTriedApiRef.current = true;
       retryCountRef.current = 0;
    } catch (err) {
      // Log silencioso - não alarma o usuário
      if (!hasTriedApiRef.current) {
        console.info('API não disponível, usando dados de demonstração:', err);
      }
      
      hasTriedApiRef.current = true;
      retryCountRef.current++;
      
      // Fallback silencioso para mock data
      if (mockVehiclesRef.current.length === 0) {
        mockVehiclesRef.current = getAnimatedMockVehicles();
      } else {
        mockVehiclesRef.current = animateLocalMockVehicles(mockVehiclesRef.current);
      }
      setVehicles(processVehicles(mockVehiclesRef.current, true));
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
    }, [isDemo, isDemoFromContext, loginDemoFn, animateLocalMockVehicles]);

  // Listener para atualizações via Socket.io
  useEffect(() => {
    if (isDemo || API_CONFIG.FORCE_MOCK_DATA) return;
    const unsubscribe = onVehicleUpdate((updatedVehicles) => {
      if (updatedVehicles.length === 0) return;
      setVehicles(prev => {
        const updatedMap = new Map(updatedVehicles.map(v => [v.device_id, v]));
        return prev.map(vehicle => {
          const updated = updatedMap.get(vehicle.device_id);
          if (updated) {
            return {
              ...vehicle,
              latitude: updated.latitude,
              longitude: updated.longitude,
              speed: updated.speed,
              address: updated.address,
              devicetime: updated.devicetime,
              ignition: updated.ignition,
              blocked: updated.blocked,
              alarm: updated.alarm,
              isMoving: updated.speed > 0,
              status: updated.speed > 5 ? 'moving' : updated.speed > 0 ? 'idle' : 'stopped',
            };
          }
          return vehicle;
        });
      });
      setLastUpdate(new Date());
      setIsUsingMockData(false);
    });
    socketCleanupRef.current = unsubscribe;
    return () => { unsubscribe(); };
  }, [isDemo]);

  useEffect(() => {
    // Limpa timer ao desmontar
    return () => {
      if (autoFallbackTimerRef.current) {
        clearTimeout(autoFallbackTimerRef.current);
      }
      if (socketCleanupRef.current) {
        socketCleanupRef.current();
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
    if (!device.id) return;

    const applyToVehicle = (v: VehicleWithStatus | Vehicle): VehicleWithStatus | Vehicle => ({
      ...v,
      device_name: device.plate || device.name || v.device_name,
      vehicleType: device.vehicleType ?? v.vehicleType,
      iconColor: device.iconColor ?? v.iconColor,
      documentation: {
        ipvaExpiry: device.ipvaExpiry,
        insuranceExpiry: device.insuranceExpiry,
        licensingExpiry: device.licensingExpiry,
        trailers: device.trailers,
      },
    });

    // Atualiza as fontes (para não ser sobrescrito no refresh)
    if (demoVehiclesRef.current.length > 0) {
      demoVehiclesRef.current = demoVehiclesRef.current.map(v =>
        v.device_id === device.id ? (applyToVehicle(v) as Vehicle) : v
      );
    }

    if (mockVehiclesRef.current.length > 0) {
      mockVehiclesRef.current = mockVehiclesRef.current.map(v =>
        v.device_id === device.id ? (applyToVehicle(v) as Vehicle) : v
      );
    }

    setVehicles(prev => prev.map(v => {
      if (v.device_id === device.id) {
        return applyToVehicle(v) as VehicleWithStatus;
      }
      return v;
    }));
  }, []);

  // Add new vehicle to local state (for demo mode persistence)
  const addVehicle = useCallback((device: DeviceFormData) => {
    const id = device.imei || `local-${Date.now()}`;
    const baseVehicle: Vehicle = {
      device_id: id,
      device_name: device.plate || device.name || id,
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
    };

    // Atualiza a fonte ativa para persistir no refresh
    if (isDemo) {
      demoVehiclesRef.current = [baseVehicle, ...demoVehiclesRef.current];
    } else {
      mockVehiclesRef.current = [baseVehicle, ...mockVehiclesRef.current];
    }

    const newVehicle: VehicleWithStatus = {
      ...baseVehicle,
      isMoving: false,
      status: 'stopped',
      ignition: false,
      batteryLevel: 100,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  }, [isDemo]);

  return {
    vehicles,
    isLoading,
    error,
    lastUpdate,
    movingCount,
    stoppedCount,
    isUsingMockData,
     isDemoMode: isDemo,
    isSocketConnected: isSocketConnected(),
    isApiConnected: isApiConnectedFromContext,
    refetch: fetchVehicles,
    updateVehicle,
    addVehicle,
  };
}
