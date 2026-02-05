import { useState, useEffect, useCallback, useRef } from "react";
import { Vehicle, VehicleWithStatus } from "@/types/vehicle";
import { API_CONFIG } from "@/config/api";
import { generateDemoVehicles, animateDemoVehicles } from "@/data/mockDemoVehicles";
import { useAuth } from "@/contexts/AuthContext";
import type { DeviceFormData } from "@/components/admin/DeviceModal";
import {
  fetchVehiclesFromApi,
  createVehicle,
  deleteVehicleApi,
  updateVehicleApi,
  NormalizedVehicle,
} from "@/services/apiService";
import { onVehicleUpdate, isSocketConnected } from "@/services/socketService";

export function useVehicles(forceDemoMode?: boolean) {
  let isDemoFromContext = false;
  let isApiConnectedFromContext = false;

  try {
    const auth = useAuth();
    isDemoFromContext = auth.isDemoMode;
    isApiConnectedFromContext = auth.isApiConnected;
  } catch {}

  const isDemo = forceDemoMode ?? isDemoFromContext;

  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
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
        ignition: extendedVehicle.ignition,
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
      setIsUsingMockData(false);
    } catch (err) {
      console.error("Erro ao buscar veículos:", err);
      setError("Falha ao conectar com servidor");
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  // Socket
  useEffect(() => {
    if (isDemo) return;
    const unsubscribe = onVehicleUpdate((updatedVehicles) => {
      if (updatedVehicles.length === 0) return;
      setVehicles((prev) => {
        const updatedMap = new Map(updatedVehicles.map((v) => [v.device_id, v]));
        return prev.map((vehicle) => {
          const updated = updatedMap.get(vehicle.device_id);
          if (updated) {
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

  // Adicionar Veículo (API REAL)
  const addVehicle = useCallback(
    async (device: DeviceFormData) => {
      setIsLoading(true);
      try {
        await createVehicle({
          name: device.plate || device.name || "Sem Nome",
          uniqueId: device.imei,
        });
        await fetchVehicles(); // Recarrega lista
        return {} as any;
      } catch (err) {
        console.error(err);
        setError("Erro ao salvar veículo. Verifique se o IMEI já existe.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchVehicles],
  );

  // Editar Veículo (API REAL)
  const updateVehicle = useCallback(
    async (device: DeviceFormData) => {
      if (!device.id) return;
      setIsLoading(true);
      try {
        // Tenta converter ID para numero, Traccar usa ID numérico
        const idNum = parseInt(device.id);
        if (!isNaN(idNum)) {
          await updateVehicleApi(idNum, {
            name: device.plate || device.name,
            uniqueId: device.imei,
          });
          await fetchVehicles();
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao atualizar veículo");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchVehicles],
  );

  // Remover Veículo (API REAL)
  const removeVehicle = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        await deleteVehicleApi(id);
        await fetchVehicles();
      } catch (err) {
        console.error(err);
        setError("Erro ao remover veículo");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchVehicles],
  );

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
    removeVehicle, // Disponível para uso no componente
  };
}
