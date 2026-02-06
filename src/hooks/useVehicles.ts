import { useState, useEffect, useCallback } from "react";
import { Vehicle, VehicleWithStatus } from "@/types/vehicle";
import { API_CONFIG } from "@/config/api";
import type { DeviceFormData } from "@/components/admin/DeviceModal";
import {
  fetchVehiclesFromApi,
  NormalizedVehicle,
  createVehicle,
  updateVehicle as apiUpdateVehicle,
} from "@/services/apiService";
import { onVehicleUpdate, isSocketConnected } from "@/services/socketService";
import { toast } from "@/hooks/use-toast";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Normalização de dados
  const normalizedToVehicle = (nv: NormalizedVehicle): Vehicle => ({
    device_id: nv.device_id,
    device_name: nv.device_name,
    latitude: nv.latitude,
    longitude: nv.longitude,
    speed: nv.speed,
    address: nv.address,
    devicetime: nv.devicetime,
  });

  const processVehicles = (data: Vehicle[]): VehicleWithStatus[] => {
    return data.map((vehicle) => {
      const extendedVehicle = vehicle as Vehicle & { blocked?: boolean; alarm?: string | null; ignition?: boolean };
      return {
        ...vehicle,
        isMoving: vehicle.speed > 0,
        status: vehicle.speed > 5 ? "moving" : vehicle.speed > 0 ? "idle" : "stopped",
        ignition: extendedVehicle.ignition ?? vehicle.speed > 0,
        batteryLevel: 100,
        blocked: extendedVehicle.blocked,
        alarm: extendedVehicle.alarm,
      };
    });
  };

  // Veículos fictícios para teste (quando API não disponível)
  const mockVehicles: Vehicle[] = [
    {
      device_id: "mock-1",
      device_name: "ABC-1234",
      latitude: -23.5505,
      longitude: -46.6333,
      speed: 45,
      address: "Av. Paulista, 1000 - São Paulo, SP",
      devicetime: new Date().toISOString(),
      blocked: false,
      alarm: null,
    },
    {
      device_id: "mock-2",
      device_name: "XYZ-5678",
      latitude: -22.9068,
      longitude: -43.1729,
      speed: 0,
      address: "Av. Atlântica, 500 - Rio de Janeiro, RJ",
      devicetime: new Date().toISOString(),
      blocked: false,
      alarm: null,
    },
  ];

  // Busca dados da API
  const fetchVehicles = useCallback(async () => {
    try {
      setError(null);
      const normalizedData = await fetchVehiclesFromApi();

      if (!normalizedData || normalizedData.length === 0) {
        // Usa veículos de teste quando API não retorna dados
        console.log("API sem dados - usando veículos de teste");
        setVehicles(processVehicles(mockVehicles));
        setLastUpdate(new Date());
        return;
      }

      const data: Vehicle[] = normalizedData.map(normalizedToVehicle);
      setVehicles(processVehicles(data));
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erro ao buscar veículos:", err);
      // Usa veículos de teste em caso de erro de conexão
      console.log("Erro de conexão - usando veículos de teste");
      setVehicles(processVehicles(mockVehicles));
      setLastUpdate(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSockets
  useEffect(() => {
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
              status: updated.speed > 5 ? "moving" : updated.speed > 0 ? "idle" : "stopped",
              isMoving: updated.speed > 0,
            };
          }
          return vehicle;
        });
      });
      setLastUpdate(new Date());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Loop de atualização (Polling)
  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, API_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  // Atualizar Veículo (PUT na API)
  const updateVehicle = useCallback(
    async (device: DeviceFormData) => {
      if (!device.id) return;
      try {
        await apiUpdateVehicle(device.id, {
          id: Number(device.id),
          name: device.plate || device.name,
          uniqueId: device.imei,
        });

        fetchVehicles();
      } catch (err) {
        console.error("Erro ao atualizar veículo:", err);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível atualizar o veículo no servidor.",
          variant: "destructive",
        });
      }
    },
    [fetchVehicles],
  );

  // Adicionar Veículo (POST na API)
  const addVehicle = useCallback(
    async (device: DeviceFormData) => {
      try {
        await createVehicle({
          name: device.plate || device.name,
          uniqueId: device.imei,
        });

        fetchVehicles();
      } catch (err) {
        console.error("Erro ao criar veículo:", err);
        toast({
          title: "Erro ao criar",
          description: "Não foi possível cadastrar o veículo. Verifique se o IMEI já existe.",
          variant: "destructive",
        });
        throw err;
      }
    },
    [fetchVehicles],
  );

  const movingCount = vehicles.filter((v) => v.speed > 5).length;
  const stoppedCount = vehicles.filter((v) => v.speed <= 5).length;

  return {
    vehicles,
    isLoading,
    error,
    lastUpdate,
    movingCount,
    stoppedCount,
    isSocketConnected: isSocketConnected(),
    isApiConnected: true,
    refetch: fetchVehicles,
    updateVehicle,
    addVehicle,
  };
}
