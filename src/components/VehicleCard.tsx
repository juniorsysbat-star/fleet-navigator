import { VehicleWithStatus } from '@/types/vehicle';
import { Car, Gauge, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg transition-all duration-300",
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
              vehicle.isMoving
                ? "border-success bg-success/10"
                : "border-destructive bg-destructive/10"
            )}
            style={{
              boxShadow: vehicle.isMoving
                ? '0 0 15px hsl(var(--neon-green) / 0.4)'
                : '0 0 15px hsl(var(--neon-red) / 0.4)',
            }}
          >
            <Car
              className={cn(
                "w-5 h-5",
                vehicle.isMoving ? "text-success" : "text-destructive"
              )}
            />
          </div>
          
          {/* Pulsing dot for moving vehicles */}
          {vehicle.isMoving && (
            <span className="absolute -top-1 -right-1 w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
            </span>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-foreground truncate text-sm">
              {vehicle.device_name}
            </h3>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                vehicle.isMoving
                  ? "bg-success/20 text-success"
                  : "bg-destructive/20 text-destructive"
              )}
            >
              {vehicle.isMoving ? 'ATIVO' : 'PARADO'}
            </span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Gauge className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
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
