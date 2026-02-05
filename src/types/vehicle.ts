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
  | 'bg-gray-500'
  | 'bg-yellow-500'
  | 'bg-emerald-500';

export function getStatusColor(vehicle: Pick<VehicleWithStatus, 'alarm' | 'alert' | 'blocked' | 'status' | 'speed'>): StatusColorClass {
  // SE tiver qualquer valor no campo de alarme OU estiver bloqueado -> VERMELHO
  if (vehicle.alarm || vehicle.alert || vehicle.blocked) return 'bg-red-500';

  // Se não tem alarme, mas está offline -> CINZA
  if (vehicle.status === 'offline') return 'bg-gray-500';

  // Se online e velocidade 0 -> AMARELO
  if (vehicle.speed < 1) return 'bg-yellow-500';

  // Se online e andando -> VERDE
  return 'bg-emerald-500';
}

export type MarkerStatus = 'moving' | 'idle' | 'offline' | 'unknown' | 'speeding';

export function getStatusVisual(vehicle: VehicleWithStatus) {
  const bgClass = getStatusColor(vehicle);
  const textClass = bgClass.replace('bg-', 'text-') as
    | 'text-red-500'
    | 'text-gray-500'
    | 'text-yellow-500'
    | 'text-emerald-500';

  const borderClass = bgClass.replace('bg-', 'border-') as
    | 'border-red-500'
    | 'border-gray-500'
    | 'border-yellow-500'
    | 'border-emerald-500';

  const softBgClass = (bgClass + '/10') as string;

  const markerStatus: MarkerStatus =
    bgClass === 'bg-red-500'
      ? 'speeding'
      : bgClass === 'bg-gray-500'
        ? 'offline'
        : bgClass === 'bg-yellow-500'
          ? 'idle'
          : 'moving';

  return {
    bgClass,
    textClass,
    borderClass,
    softBgClass,
    markerStatus,
  };
}

// Unified status logic with alert priority
// Priority: Alert (red) > Offline (gray) > Idle (yellow) > Moving (blue/green)
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

  // PRIORITY 0 (Maximum) - 🔴 RED: Alerts/Blocks/Violations
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

  // PRIORITY 1 - ⚪ GRAY: Offline
  if (vehicle.status === 'offline' || isStale || vehicle.ignition === false) {
    return {
      status: 'offline',
      label: 'OFFLINE',
      colorClass: 'text-gray-500',
      dotClass: 'bg-gray-500',
      borderClass: 'border-gray-500',
      bgClass: 'bg-gray-500/10',
      glowColor: 'none',
    };
  }

  // PRIORITY 2 - 🟡 YELLOW: Stopped (speed < 2)
  if (vehicle.speed < 2) {
    return {
      status: 'idle',
      label: 'PARADO LIGADO',
      colorClass: 'text-yellow-500',
      dotClass: 'bg-yellow-500',
      borderClass: 'border-yellow-500',
      bgClass: 'bg-yellow-500/10',
      glowColor: 'rgba(234, 179, 8, 0.4)',
    };
  }

  // PRIORITY 3 - 🔵 BLUE: Moving (speed >= 2)
  return {
    status: 'moving',
    label: 'EM MOVIMENTO',
    colorClass: 'text-blue-500',
    dotClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-500/10',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  };
}
