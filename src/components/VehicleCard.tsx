import { VehicleWithStatus, VehicleStatus } from '@/types/vehicle';
import { Car, Gauge, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: VehicleWithStatus;
  isSelected: boolean;
  onClick: () => void;
}

const getDetailedStatus = (vehicle: VehicleWithStatus): { 
  status: VehicleStatus; 
  label: string; 
  colorClass: string;
  dotClass: string;
} => {
  if (vehicle.speed > 5) {
    return { 
      status: 'moving', 
      label: 'EM MOVIMENTO', 
      colorClass: 'text-success',
      dotClass: 'bg-success'
    };
  } else if (vehicle.ignition === true || (vehicle.speed > 0 && vehicle.speed <= 5)) {
    return { 
      status: 'idle', 
      label: 'PARADO LIGADO', 
      colorClass: 'text-warning',
      dotClass: 'bg-warning'
    };
  } else if (vehicle.ignition === false) {
    return { 
      status: 'offline', 
      label: 'OFFLINE', 
      colorClass: 'text-destructive',
      dotClass: 'bg-destructive'
    };
  }
  return { 
    status: 'unknown', 
    label: 'DESCONHECIDO', 
    colorClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground'
  };
};

export function VehicleCard({ vehicle, isSelected, onClick }: VehicleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusInfo = getDetailedStatus(vehicle);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-all duration-300",
        "border hover:border-accent/50",
        "group cursor-pointer",
        isSelected
          ? "bg-secondary/80 border-accent shadow-[0_0_20px_hsl(var(--neon-cyan)/0.2)]"
          : "bg-card/50 border-border hover:bg-secondary/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Vehicle Icon with Status Indicator */}
        <div className="relative">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "border-2 transition-all duration-300",
              statusInfo.status === 'moving' && "border-success bg-success/10",
              statusInfo.status === 'idle' && "border-warning bg-warning/10",
              statusInfo.status === 'offline' && "border-destructive bg-destructive/10",
              statusInfo.status === 'unknown' && "border-muted-foreground bg-muted/10"
            )}
            style={{
              boxShadow: statusInfo.status === 'moving'
                ? '0 0 15px hsl(var(--neon-green) / 0.4)'
                : statusInfo.status === 'idle'
                ? '0 0 15px hsl(var(--neon-yellow) / 0.4)'
                : statusInfo.status === 'offline'
                ? '0 0 15px hsl(var(--neon-red) / 0.4)'
                : 'none',
            }}
          >
            <Car
              className={cn(
                "w-5 h-5",
                statusInfo.status === 'moving' && "text-success",
                statusInfo.status === 'idle' && "text-warning",
                statusInfo.status === 'offline' && "text-destructive",
                statusInfo.status === 'unknown' && "text-muted-foreground"
              )}
            />
          </div>
          
          {/* Pulsing dot for moving vehicles */}
          {statusInfo.status === 'moving' && (
            <span className="absolute -top-1 -right-1 w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
            </span>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-display font-semibold text-foreground truncate text-sm">
              {vehicle.device_name}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", statusInfo.dotClass)} />
              <span
                className={cn(
                  "text-[10px] font-bold",
                  statusInfo.colorClass
                )}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Gauge className="w-3.5 h-3.5" />
            <span className={cn(
              "text-xs font-medium",
              vehicle.speed > 80 && "text-destructive"
            )}>
              {vehicle.speed.toFixed(1)} km/h
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-muted-foreground mb-1">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="text-xs line-clamp-1">
              {vehicle.address || 'Carregando...'}
            </span>
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <Clock className="w-3 h-3" />
            <span className="text-[10px]">{formatDate(vehicle.devicetime)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
