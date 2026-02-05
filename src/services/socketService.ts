 import { io, Socket } from 'socket.io-client';
 import { API_CONFIG } from '@/config/api';
 import { NormalizedVehicle } from './apiService';
 
 // ============================================
 // SOCKET.IO SERVICE - Atualizações em tempo real
 // ============================================
 
 type VehicleUpdateCallback = (vehicles: NormalizedVehicle[]) => void;
 type ConnectionCallback = (connected: boolean) => void;
 
 let socket: Socket | null = null;
 let vehicleUpdateListeners: VehicleUpdateCallback[] = [];
 let connectionListeners: ConnectionCallback[] = [];
 
 // Normaliza dados recebidos via socket
 function normalizeSocketVehicle(raw: Record<string, unknown>): NormalizedVehicle {
   return {
     device_id: String(raw.device_id ?? raw.deviceId ?? raw.id ?? ''),
     device_name: String(raw.device_name ?? raw.deviceName ?? raw.name ?? ''),
     latitude: Number(raw.latitude ?? raw.lat ?? 0),
     longitude: Number(raw.longitude ?? raw.lng ?? raw.lon ?? 0),
     speed: Number(raw.speed ?? raw.velocidade ?? 0),
     address: String(raw.address ?? raw.endereco ?? ''),
     devicetime: String(raw.devicetime ?? raw.lastUpdate ?? new Date().toISOString()),
     ignition: raw.ignition as boolean | undefined,
     blocked: raw.blocked as boolean | undefined,
     alarm: raw.alarm as string | null ?? null,
   };
 }
 
 export function connectSocket(token?: string) {
   if (!API_CONFIG.SOCKET_ENABLED) {
     console.info('Socket.io desabilitado na configuração');
     return;
   }
 
   if (socket?.connected) {
     console.info('Socket já conectado');
     return;
   }
 
   // Desconecta socket existente
   if (socket) {
     socket.disconnect();
   }
 
   console.info('Conectando ao Socket.io:', API_CONFIG.BASE_URL);
 
   socket = io(API_CONFIG.BASE_URL, {
     auth: token ? { token } : undefined,
     transports: ['websocket', 'polling'],
     reconnection: true,
     reconnectionAttempts: 5,
     reconnectionDelay: 2000,
     timeout: 10000,
   });
 
   socket.on('connect', () => {
     console.info('Socket.io conectado!');
     notifyConnectionListeners(true);
   });
 
   socket.on('disconnect', (reason) => {
     console.info('Socket.io desconectado:', reason);
     notifyConnectionListeners(false);
   });
 
   socket.on('connect_error', (error) => {
     console.warn('Erro de conexão Socket.io:', error.message);
     notifyConnectionListeners(false);
   });
 
   // Eventos de atualização de veículos (nomes comuns que sua API pode usar)
   const vehicleEvents = ['vehicles', 'positions', 'update', 'vehicleUpdate', 'position'];
   
   vehicleEvents.forEach(event => {
     socket?.on(event, (data: unknown) => {
       try {
         const vehicles = Array.isArray(data) ? data : [data];
         const normalized = vehicles.map(v => normalizeSocketVehicle(v as Record<string, unknown>));
         notifyVehicleUpdateListeners(normalized);
       } catch (error) {
         console.warn(`Erro ao processar evento ${event}:`, error);
       }
     });
   });
 }
 
 export function disconnectSocket() {
   if (socket) {
     socket.disconnect();
     socket = null;
   }
 }
 
 export function isSocketConnected(): boolean {
   return socket?.connected ?? false;
 }
 
 // ============================================
 // LISTENERS
 // ============================================
 function notifyVehicleUpdateListeners(vehicles: NormalizedVehicle[]) {
   vehicleUpdateListeners.forEach(callback => callback(vehicles));
 }
 
 function notifyConnectionListeners(connected: boolean) {
   connectionListeners.forEach(callback => callback(connected));
 }
 
 export function onVehicleUpdate(callback: VehicleUpdateCallback): () => void {
   vehicleUpdateListeners.push(callback);
   return () => {
     vehicleUpdateListeners = vehicleUpdateListeners.filter(cb => cb !== callback);
   };
 }
 
 export function onConnectionChange(callback: ConnectionCallback): () => void {
   connectionListeners.push(callback);
   return () => {
     connectionListeners = connectionListeners.filter(cb => cb !== callback);
   };
 }
 
 // Emite evento para o servidor (se necessário)
 export function emitEvent(event: string, data: unknown) {
   if (socket?.connected) {
     socket.emit(event, data);
   }
 }