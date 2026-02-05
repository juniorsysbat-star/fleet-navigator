 import { VehicleWithStatus, getStatusVisual } from '@/types/vehicle';
 import { Gauge, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
 import { getVehicleIcon } from '@/utils/vehicleIcons';

interface VehicleCardProps {
  vehicle: VehicleWithStatus;
  isSelected: boolean;
  onClick: () => void;
}

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

  const { bgClass, textClass, borderClass, softBgClass, statusLabel } = getStatusVisual(vehicle);
  const isAlert = Boolean(vehicle.blocked || vehicle.alarm || vehicle.alert);

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
              borderClass,
                softBgClass,
                isAlert && "animate-pulse"
            )}
            style={{
              boxShadow:
                isAlert
                  ? '0 0 15px rgba(239, 68, 68, 0.8)'
                  : bgClass === 'bg-emerald-500'
                    ? '0 0 15px rgba(16, 185, 129, 0.4)'
                    : 'none',
            }}
          >
             <span className={textClass}>
               {getVehicleIcon({ type: vehicle.vehicleType, className: "w-5 h-5" })}
             </span>
          </div>
          
          {/* Pulsing dot for alerts or moving vehicles */}
            {(isAlert || vehicle.speed >= 1) && (
            <span className="absolute -top-1 -right-1 w-3 h-3">
              <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", bgClass)} />
              <span className={cn("relative inline-flex rounded-full h-3 w-3", bgClass)} />
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
              <span className={cn("w-2 h-2 rounded-full", bgClass)} />
              <span
                className={cn("text-[10px] font-bold", textClass)}
              >
                {statusLabel}
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
