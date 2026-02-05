export type VehicleType = 'sedan' | 'motorcycle' | 'truck' | 'pickup' | 'tractor' | 'bus';

export type TrailerType = 'bau' | 'sider' | 'graneleiro' | 'tanque' | 'cegonha' | 'prancha';

export interface Trailer {
  id: string;
  plate: string;
  type: TrailerType;
  documentExpiry: string;
  notes?: string;
}

export interface VehicleDocumentation {
  ipvaExpiry?: string;
  insuranceExpiry?: string;
  licensingExpiry?: string;
  trailers?: Trailer[];
}

export interface Vehicle {
  device_id: string;
  device_name: string;
  latitude: number;
  longitude: number;
  speed: number;
  address: string;
  devicetime: string;
  vehicleType?: VehicleType;
  iconColor?: string;
  documentation?: VehicleDocumentation;

  // Alert fields (may come from API or mocks)
  blocked?: boolean;
  alarm?: string | null;
  alert?: boolean;
}

export type VehicleStatus = 'moving' | 'stopped' | 'idle' | 'offline' | 'unknown';
export type VehicleAlertStatus = 'alert' | 'moving' | 'idle' | 'offline' | 'unknown';

export interface VehicleWithStatus extends Vehicle {
  isMoving: boolean;
  status: VehicleStatus;
  ignition?: boolean;
  batteryLevel?: number;
  historyTrail?: { lat: number; lng: number }[];
}

// === Color logic (single source of truth) ===
// Matches the user's requested priority (alerts override everything)
export type StatusColorClass =
  | 'bg-red-500'
  | 'bg-gray-400'
  | 'bg-emerald-500';

export function getStatusColor(vehicle: Pick<VehicleWithStatus, 'alarm' | 'alert' | 'blocked' | 'status' | 'speed' | 'devicetime' | 'ignition'>): StatusColorClass {
  // Calcula se a comunicação é recente (< 10 minutos)
  const lastUpdate = new Date(vehicle.devicetime);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  const isOnline = diffMinutes < 10;

  // PRIORIDADE 1: SE tiver qualquer valor no campo de alarme OU estiver bloqueado -> VERMELHO
  if (vehicle.alarm || vehicle.alert || vehicle.blocked) return 'bg-red-500';

  // PRIORIDADE 2: Se não tem alarme E está sem comunicação há mais de 10 min -> CINZA (Offline)
  if (!isOnline) return 'bg-gray-400';

  // PRIORIDADE 3: Se online (tem sinal e não tem alarme) -> VERDE (andando OU parado)
  return 'bg-emerald-500';
}

export type MarkerStatus = 'moving' | 'idle' | 'offline' | 'unknown' | 'speeding';

export function getStatusVisual(vehicle: VehicleWithStatus) {
  const bgClass = getStatusColor(vehicle);
  
  // Map colors consistently
  const colorMap: Record<StatusColorClass, { text: string; border: string }> = {
    'bg-red-500': { text: 'text-red-500', border: 'border-red-500' },
    'bg-gray-400': { text: 'text-gray-400', border: 'border-gray-400' },
    'bg-emerald-500': { text: 'text-emerald-500', border: 'border-emerald-500' },
  };
  
  const textClass = colorMap[bgClass].text;
  const borderClass = colorMap[bgClass].border;

  const softBgClass = (bgClass + '/10') as string;

  // Simplified triad: speeding (red), offline (gray), moving (green)
  const markerStatus: MarkerStatus =
    bgClass === 'bg-red-500'
      ? 'speeding'
      : bgClass === 'bg-gray-400'
        ? 'offline'
        : 'moving';

  // Simplified label - triad system
  const statusLabel =
    bgClass === 'bg-red-500'
      ? vehicle.blocked
        ? 'BLOQUEADO'
        : vehicle.alarm
          ? `ALARME (${String(vehicle.alarm).toUpperCase()})`
          : 'ALERTA ATIVO'
      : bgClass === 'bg-gray-400'
        ? 'OFFLINE / SEM SINAL'
        : vehicle.speed >= 2
          ? 'EM MOVIMENTO'
          : 'ONLINE (PARADO)';

  return {
    bgClass,
    textClass,
    borderClass,
    softBgClass,
    markerStatus,
    statusLabel,
  };
}

// Unified status logic with alert priority
// Simplified Triad: Alert (red) > Offline (gray) > Online (green)
export interface VehicleStatusInfo {
  status: VehicleAlertStatus;
  label: string;
  colorClass: string;
  dotClass: string;
  borderClass: string;
  bgClass: string;
  glowColor: string;
}

export function getVehicleStatusWithPriority(vehicle: VehicleWithStatus): VehicleStatusInfo {
  // Check last update time (offline if > 10 minutes)
  const lastUpdate = new Date(vehicle.devicetime);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  const isStale = diffMinutes > 10;

  // PRIORIDADE 1 - 🔴 RED: Alerts/Blocks/Violations
  if (
    vehicle.blocked === true ||
    (vehicle.alarm !== null && vehicle.alarm !== undefined) ||
    (vehicle.ignition === false && vehicle.speed > 0) // Tow truck / violation
  ) {
    const alertReason = vehicle.blocked 
      ? 'BLOQUEADO' 
      : vehicle.alarm 
        ? 'ALERTA ATIVO' 
        : 'VIOLAÇÃO';
    
    return {
      status: 'alert',
      label: alertReason,
      colorClass: 'text-red-500',
      dotClass: 'bg-red-500',
      borderClass: 'border-red-500',
      bgClass: 'bg-red-500/10',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    };
  }

  // PRIORIDADE 2 - ⚪ GRAY: Offline (sem comunicação > 10 min)
  if (vehicle.status === 'offline' || isStale) {
    return {
      status: 'offline',
      label: 'OFFLINE',
      colorClass: 'text-gray-400',
      dotClass: 'bg-gray-400',
      borderClass: 'border-gray-400',
      bgClass: 'bg-gray-400/10',
      glowColor: 'none',
    };
  }

  // PRIORIDADE 3 - 🟢 EMERALD: Online (andando OU parado - tem sinal e não tem alarme)
  return {
    status: 'moving',
    label: vehicle.speed >= 2 ? 'EM MOVIMENTO' : 'ONLINE (PARADO)',
    colorClass: 'text-emerald-500',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-500/10',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  };
}
