import { API_CONFIG, buildUrl } from "@/config/api";

// ============================================
// SERVIÇO DE API - Data Fleet Pro (Traccar Native)
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    administrator: boolean;
  };
  message?: string;
  token?: string;
}

interface TraccarDevice {
  id: number;
  name: string;
  uniqueId: string;
  status: string;
  disabled: boolean;
  lastUpdate: string;
  positionId: number;
  groupId: number;
  phone: string;
  model: string;
  contact: string;
  category: string;
  attributes: Record<string, any>;
}

interface TraccarPosition {
  id: number;
  deviceId: number;
  protocol: string;
  deviceTime: string;
  fixTime: string;
  serverTime: string;
  outdated: boolean;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address: string;
  attributes: {
    ignition?: boolean;
    blocked?: boolean;
    alarm?: string;
    [key: string]: any;
  };
}

export interface NormalizedVehicle {
  device_id: string;
  device_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  address: string;
  devicetime: string;
  ignition?: boolean;
  blocked?: boolean;
  alarm?: string | null;
  status?: string;
}

let authToken: string | null = localStorage.getItem("datafleet_token");

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem("datafleet_token", token);
  } else {
    localStorage.removeItem("datafleet_token");
  }
};

export const getAuthToken = () => authToken;

const getHeaders = (isFormUrlEncoded = false): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (isFormUrlEncoded) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout = API_CONFIG.REQUEST_TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include", // Importante para cookies do Traccar
    signal: controller.signal,
    headers: { ...getHeaders(), ...options.headers },
  };

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) errorMsg = errorBody;
      } catch {}
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// AUTENTICAÇÃO
// ============================================
export async function apiLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const formData = new URLSearchParams();
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    const user = await fetchWithTimeout<any>(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    return {
      success: true,
      user: user,
      token: btoa(credentials.email),
    };
  } catch (error) {
    console.error("Erro no login Traccar:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Falha na autenticação",
    };
  }
}

export async function apiLogout() {
  try {
    await fetchWithTimeout(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      method: "DELETE",
    });
  } catch (e) {
    console.warn("Erro ao fazer logout remoto", e);
  }
  setAuthToken(null);
}

// ============================================
// VEÍCULOS & POSIÇÕES
// ============================================

export async function fetchVehiclesFromApi(): Promise<NormalizedVehicle[]> {
  try {
    const [devices, positions] = await Promise.all([
      fetchWithTimeout<TraccarDevice[]>(buildUrl(API_CONFIG.ENDPOINTS.VEHICLES)),
      fetchWithTimeout<TraccarPosition[]>(buildUrl(API_CONFIG.ENDPOINTS.POSITIONS)),
    ]);

    const posMap = new Map<number, TraccarPosition>();
    positions.forEach((p) => posMap.set(p.deviceId, p));

    return devices.map((device) => {
      const pos = posMap.get(device.id);
      const speedKmh = pos ? pos.speed * 1.852 : 0;

      return {
        device_id: String(device.id),
        device_name: device.name,
        latitude: pos?.latitude || 0,
        longitude: pos?.longitude || 0,
        speed: Math.round(speedKmh),
        address: pos?.address || "",
        devicetime: pos?.deviceTime || device.lastUpdate || new Date().toISOString(),
        ignition: pos?.attributes?.ignition ?? false,
        blocked: pos?.attributes?.blocked ?? false,
        alarm: pos?.attributes?.alarm ?? null,
        status: device.status,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar veículos Traccar:", error);
    throw error;
  }
}

// ============================================
// CRUD DE DISPOSITIVOS (NOVO)
// ============================================

export async function createVehicle(data: { name: string; uniqueId: string }) {
  try {
    return await fetchWithTimeout(buildUrl(API_CONFIG.ENDPOINTS.VEHICLES), {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Erro ao criar veículo:", error);
    throw error;
  }
}

export async function updateVehicle(id: string, data: Partial<TraccarDevice>) {
  try {
    // Traccar exige o ID na URL e no corpo
    const url = `${buildUrl(API_CONFIG.ENDPOINTS.VEHICLES)}/${id}`;
    return await fetchWithTimeout(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Erro ao atualizar veículo:", error);
    throw error;
  }
}

export async function deleteVehicle(id: string) {
  try {
    const url = `${buildUrl(API_CONFIG.ENDPOINTS.VEHICLES)}/${id}`;
    await fetchWithTimeout(url, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Erro ao deletar veículo:", error);
    throw error;
  }
}

// ============================================
// HEALTH CHECK
// ============================================
export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(buildUrl("/api/server"), {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
