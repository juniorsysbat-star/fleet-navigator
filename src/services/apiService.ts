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
    id: number; // Traccar usa IDs numéricos
    name: string;
    email: string;
    administrator: boolean;
    // Outros campos do Traccar...
  };
  message?: string;
}

// Estrutura Real do Traccar (/api/devices)
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

// Estrutura Real do Traccar (/api/positions)
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
  speed: number; // Nós = Knots
  course: number;
  address: string;
  attributes: {
    ignition?: boolean;
    blocked?: boolean;
    alarm?: string;
    [key: string]: any;
  };
}

// Estrutura normalizada para o frontend
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

// O Traccar usa Cookies, não Token Bearer. Mas mantemos compatibilidade local.
let authToken: string | null = localStorage.getItem("datafleet_token");

export const setAuthToken = (token: string | null) => {
  // No Traccar oficial, o "token" é o cookie de sessão gerado automaticamente pelo navegador.
  // Mantemos essa função apenas para lógica interna do frontend se necessário.
  authToken = token;
  if (token) {
    localStorage.setItem("datafleet_token", token);
  } else {
    localStorage.removeItem("datafleet_token");
  }
};

export const getAuthToken = () => authToken;

// Headers padrão
// O Traccar precisa de credentials: 'include' no fetch para enviar cookies
const getHeaders = (isFormUrlEncoded = false): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (isFormUrlEncoded) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else {
    headers["Content-Type"] = "application/json";
  }

  // Se estivéssemos usando token no header (versões antigas ou proxy):
  // if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  return headers;
};

// Função genérica de fetch com timeout
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout = API_CONFIG.REQUEST_TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // IMPORTANTE: credentials: 'include' permite enviar/receber cookies do Traccar
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include",
    signal: controller.signal,
    headers: { ...getHeaders(), ...options.headers },
  };

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Tenta ler erro do corpo se existir
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) errorMsg = errorBody;
      } catch {}
      throw new Error(errorMsg);
    }

    // Se for resposta vazia (logout as vezes retorna 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// AUTENTICAÇÃO (Traccar Nativo)
// ============================================
export async function apiLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // 1. Converter JSON para URLSearchParams (Form Data)
    const formData = new URLSearchParams();
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    // 2. Fazer POST com form-urlencoded
    const user = await fetchWithTimeout<any>(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    // Se chegou aqui, login deu certo e cookie foi setado
    // O Traccar retorna o objeto do usuário logado
    return {
      success: true,
      user: user,
      // Usamos o email como "token" fake só para persistir estado local
      // O verdadeiro auth é o cookie
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
    // O endpoint de logout é DELETE /api/session
    await fetchWithTimeout(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      method: "DELETE",
    });
  } catch (e) {
    console.warn("Erro ao fazer logout remoto", e);
  }
  setAuthToken(null);
}

// ============================================
// VEÍCULOS & POSIÇÕES (Merge de /devices e /positions)
// ============================================

export async function fetchVehiclesFromApi(): Promise<NormalizedVehicle[]> {
  try {
    // No Traccar, para ter dados completos, precisamos de Devices (nomes) + Positions (lat/lon)
    // Fazemos em paralelo para ser rápido
    const [devices, positions] = await Promise.all([
      fetchWithTimeout<TraccarDevice[]>(buildUrl(API_CONFIG.ENDPOINTS.VEHICLES)),
      fetchWithTimeout<TraccarPosition[]>(buildUrl(API_CONFIG.ENDPOINTS.POSITIONS)),
    ]);

    // Criar mapa de posições para acesso rápido
    const posMap = new Map<number, TraccarPosition>();
    positions.forEach((p) => posMap.set(p.deviceId, p));

    // Combinar dados
    return devices.map((device) => {
      const pos = posMap.get(device.id);

      // Converter velocidade de Knots (Nós) para km/h se necessário
      // Traccar geralmente retorna em Nós. 1 Nó = 1.852 km/h
      const speedKmh = pos ? pos.speed * 1.852 : 0;

      return {
        device_id: String(device.id),
        device_name: device.name,
        latitude: pos?.latitude || 0,
        longitude: pos?.longitude || 0,
        speed: Math.round(speedKmh), // Arredondar
        address: pos?.address || "",
        devicetime: pos?.deviceTime || device.lastUpdate || new Date().toISOString(),
        ignition: pos?.attributes?.ignition ?? false,
        blocked: pos?.attributes?.blocked ?? false, // Pode variar dependendo do rastreador
        alarm: pos?.attributes?.alarm ?? null,
        status: device.status, // 'online', 'offline', 'unknown'
      };
    });
  } catch (error) {
    console.error("Erro ao buscar veículos Traccar:", error);
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

    // Testar com /api/server (endpoint leve)
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
