 import { API_CONFIG, buildUrl } from '@/config/api';
 
 // ============================================
 // SERVIÇO DE API - Data Fleet Pro
 // ============================================
 // Centraliza todas as chamadas à API Middleware
 
 interface LoginCredentials {
   email: string;
   password: string;
 }
 
 interface LoginResponse {
   success: boolean;
   token?: string;
   user?: {
     id: string;
     name: string;
     email: string;
     role: string;
   };
   message?: string;
 }
 
 // Estrutura que pode vir da API (campos podem variar)
 interface ApiVehicle {
   id?: string;
   device_id?: string;
   deviceId?: string;
   name?: string;
   device_name?: string;
   deviceName?: string;
   lat?: number;
   latitude?: number;
   lng?: number;
   lon?: number;
   longitude?: number;
   speed?: number;
   velocidade?: number;
   status?: string;
   address?: string;
   endereco?: string;
   devicetime?: string;
   lastUpdate?: string;
   positionTime?: string;
   ignition?: boolean;
   blocked?: boolean;
   alarm?: string;
   attributes?: Record<string, unknown>;
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
 }
 
 // Token de autenticação (armazenado em memória e localStorage)
 let authToken: string | null = localStorage.getItem('datafleet_token');
 
 export const setAuthToken = (token: string | null) => {
   authToken = token;
   if (token) {
     localStorage.setItem('datafleet_token', token);
   } else {
     localStorage.removeItem('datafleet_token');
   }
 };
 
 export const getAuthToken = () => authToken;
 
 // Headers padrão para requisições
 const getHeaders = (): HeadersInit => {
   const headers: HeadersInit = {
     'Content-Type': 'application/json',
   };
   if (authToken) {
     headers['Authorization'] = `Bearer ${authToken}`;
   }
   return headers;
 };
 
 // Função genérica de fetch com timeout
 async function fetchWithTimeout<T>(
   url: string,
   options: RequestInit = {},
   timeout = API_CONFIG.REQUEST_TIMEOUT
 ): Promise<T> {
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), timeout);
 
   try {
     const response = await fetch(url, {
       ...options,
       signal: controller.signal,
       headers: { ...getHeaders(), ...options.headers },
     });
 
     clearTimeout(timeoutId);
 
     if (!response.ok) {
       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
     const data = await fetchWithTimeout<LoginResponse>(
       buildUrl(API_CONFIG.ENDPOINTS.LOGIN),
       {
         method: 'POST',
         body: JSON.stringify(credentials),
       }
     );
 
     if (data.token) {
       setAuthToken(data.token);
     }
 
     return data;
   } catch (error) {
     console.error('Erro no login:', error);
     return {
       success: false,
       message: error instanceof Error ? error.message : 'Erro de conexão',
     };
   }
 }
 
 export function apiLogout() {
   setAuthToken(null);
 }
 
 // ============================================
 // VEÍCULOS - Mapeamento de campos
 // ============================================
 function normalizeVehicle(raw: ApiVehicle): NormalizedVehicle {
   // Mapeia diferentes formatos de campos para o padrão do frontend
   return {
     device_id: String(raw.device_id ?? raw.deviceId ?? raw.id ?? ''),
     device_name: raw.device_name ?? raw.deviceName ?? raw.name ?? '',
     latitude: raw.latitude ?? raw.lat ?? 0,
     longitude: raw.longitude ?? raw.lng ?? raw.lon ?? 0,
     speed: raw.speed ?? raw.velocidade ?? 0,
     address: raw.address ?? raw.endereco ?? '',
     devicetime: raw.devicetime ?? raw.lastUpdate ?? raw.positionTime ?? new Date().toISOString(),
     ignition: raw.ignition,
     blocked: raw.blocked,
     alarm: raw.alarm ?? null,
   };
 }
 
 export async function fetchVehiclesFromApi(): Promise<NormalizedVehicle[]> {
   try {
     // Tenta primeiro o endpoint /vehicles
     const rawData = await fetchWithTimeout<ApiVehicle[]>(
       buildUrl(API_CONFIG.ENDPOINTS.VEHICLES)
     );
 
     return rawData.map(normalizeVehicle);
   } catch (error) {
     // Fallback para /api/positions se /vehicles falhar
     console.info('Endpoint /vehicles não disponível, tentando /api/positions...');
     
     try {
       const rawData = await fetchWithTimeout<ApiVehicle[]>(
         buildUrl(API_CONFIG.ENDPOINTS.POSITIONS)
       );
       return rawData.map(normalizeVehicle);
     } catch (fallbackError) {
       console.error('Nenhum endpoint de veículos disponível:', fallbackError);
       throw fallbackError;
     }
   }
 }
 
 // ============================================
 // HEALTH CHECK
 // ============================================
 export async function checkApiHealth(): Promise<boolean> {
   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 3000);
 
     const response = await fetch(API_CONFIG.BASE_URL, {
       method: 'HEAD',
       signal: controller.signal,
     });
 
     clearTimeout(timeoutId);
     return response.ok;
   } catch {
     return false;
   }
 }