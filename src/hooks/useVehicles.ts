import { useState, useEffect, useCallback, useRef, useContext, createContext } from "react";
import { Vehicle, VehicleWithStatus } from "@/types/vehicle";
import { API_CONFIG } from "@/config/api";
import { generateDemoVehicles, animateDemoVehicles } from "@/data/mockDemoVehicles";
import type { DeviceFormData } from "@/components/admin/DeviceModal";
import { fetchVehiclesFromApi, NormalizedVehicle } from "@/services/apiService";
import { onVehicleUpdate, isSocketConnected } from "@/services/socketService";

// Create a local context reference to avoid importing useAuth (which throws)
interface AuthContextValue {
  isDemoMode: boolean;
  isApiConnected: boolean;
}

// We'll import the actual context from AuthContext module
import { AuthContext } from "@/contexts/AuthContext";

export function useVehicles(forceDemoMode?: boolean) {
  // Always call useContext - returns undefined if outside provider (won't throw)
  const authContext = useContext(AuthContext);
  
  const isDemoFromContext = authContext?.isDemoMode ?? false;
  const isApiConnectedFromContext = authContext?.isApiConnected ?? false;

  const isDemo = forceDemoMode ?? isDemoFromContext;

  // REMOVIDO: Inicialização com Mocks
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);

  // Começa true para mostrar loading real
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Só é Mock se estiver explicitamente em modo DEMO
  const [isUsingMockData, setIsUsingMockData] = useState(isDemo);

  const demoVehiclesRef = useRef<Vehicle[]>([]);
  const socketCleanupRef = useRef<(() => void) | null>(null);

  const processVehicles = (data: Vehicle[], isMock: boolean = false): VehicleWithStatus[] => {
    return data.map((vehicle) => {
      const extendedVehicle = vehicle as Vehicle & { blocked?: boolean; alarm?: string | null; ignition?: boolean };

      return {
        ...vehicle,
        isMoving: vehicle.speed > 0,
        status: vehicle.speed > 5 ? "moving" : vehicle.speed > 0 ? "idle" : "stopped",
        ignition: extendedVehicle.ignition, // Usa dado real da API
        batteryLevel: undefined, // Sem bateria fake
        blocked: extendedVehicle.blocked,
        alarm: extendedVehicle.alarm,
      };
    });
  };

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
    // MODO DEMO EXPLÍCITO (Só se usuário clicar em "Demo")
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
      return;
    }

    try {
      setIsLoading(true);
      const normalizedData = await fetchVehiclesFromApi();
      const data: Vehicle[] = normalizedData.map(normalizedToVehicle);

      setVehicles(processVehicles(data, false));
      setLastUpdate(new Date());
      setError(null);
      setIsUsingMockData(false); // Garante que flag de mock está desligada
    } catch (err) {
      console.error("Erro ao buscar veículos:", err);
      // REMOVIDO: Fallback para Mock
      // Se der erro, mantemos a lista anterior ou vazia, mas avisamos o erro
      setError("Falha ao conectar com servidor");
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  // Socket Listener
  useEffect(() => {
    if (isDemo) return;

    const unsubscribe = onVehicleUpdate((updatedVehicles) => {
      if (updatedVehicles.length === 0) return;
      setVehicles((prev) => {
        const updatedMap = new Map(updatedVehicles.map((v) => [v.device_id, v]));
        return prev.map((vehicle) => {
          const updated = updatedMap.get(vehicle.device_id);
          if (updated) {
            // Atualiza apenas os campos necessários
            return {
              ...vehicle,
              ...updated,
              isMoving: updated.speed > 0,
              status: updated.speed > 5 ? "moving" : updated.speed > 0 ? "idle" : "stopped",
            };
          }
          return vehicle;
        });
      });
      setLastUpdate(new Date());
    });

    socketCleanupRef.current = unsubscribe;
    return () => {
      unsubscribe();
    };
  }, [isDemo]);

  useEffect(() => {
    return () => {
      if (socketCleanupRef.current) socketCleanupRef.current();
    };
  }, []);

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, API_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  const movingCount = vehicles.filter((v) => v.speed > 5).length;
  const stoppedCount = vehicles.filter((v) => v.speed <= 5).length;

  // Update local (apenas otimista, ideal seria mandar pra API)
  const updateVehicle = useCallback((device: DeviceFormData) => {
    // Implementar update via API aqui se necessário no futuro
    console.log("Update vehicle requested", device);
  }, []);

  const addVehicle = useCallback((device: DeviceFormData) => {
    // Implementar create via API aqui se necessário
    console.log("Add vehicle requested", device);
    return {} as VehicleWithStatus;
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
    isSocketConnected: isSocketConnected(),
    isApiConnected: isApiConnectedFromContext,
    refetch: fetchVehicles,
    updateVehicle,
    addVehicle,
  };
}
