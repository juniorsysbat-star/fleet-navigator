import { useEffect, useState } from 'react';
import { Navigation, Clock, Route, AlertTriangle, CheckCircle, XCircle, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Mission } from '@/types/mission';
import { VehicleWithStatus } from '@/types/vehicle';
import { getDistanceToRoute, getRemainingDistance, haversineDistance } from '@/services/routingService';

interface MissionTrackerProps {
  mission: Mission;
  vehicle: VehicleWithStatus | undefined;
  onClose: () => void;
  onCancelMission: () => void;
}

export function MissionTracker({ 
  mission, 
  vehicle, 
  onClose,
  onCancelMission 
}: MissionTrackerProps) {
  const [isDeviation, setIsDeviation] = useState(false);
  const [isSpeedViolation, setIsSpeedViolation] = useState(false);
  const [remainingDistance, setRemainingDistance] = useState(mission.distance);
  const [eta, setEta] = useState(mission.duration);

  useEffect(() => {
    if (!vehicle || mission.routeCoordinates.length === 0) return;

    const vehiclePosition = { lat: vehicle.latitude, lng: vehicle.longitude };
    
    // Check deviation from route corridor
    const distanceToRoute = getDistanceToRoute(vehiclePosition, mission.routeCoordinates);
    setIsDeviation(distanceToRoute > mission.corridorWidth);

    // Check speed violation
    setIsSpeedViolation(vehicle.speed > mission.maxSpeed);

    // Calculate remaining distance
    const remaining = getRemainingDistance(vehiclePosition, mission.routeCoordinates);
    setRemainingDistance(remaining);

    // Estimate ETA (assuming average 60 km/h if stopped)
    const avgSpeed = vehicle.speed > 5 ? vehicle.speed : 60;
    const etaSeconds = (remaining / 1000) / avgSpeed * 3600;
    setEta(etaSeconds);

    // Check if arrived at destination
    const distanceToDestination = haversineDistance(vehiclePosition, mission.destination);
    if (distanceToDestination < 100) {
      console.log('🎉 Missão concluída! Veículo chegou ao destino.');
    }
  }, [vehicle, mission]);

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  const getStatusInfo = () => {
    if (isDeviation) {
      return {
        icon: AlertTriangle,
        label: 'DESVIO DETECTADO',
        color: 'text-destructive',
        bgColor: 'bg-destructive/20',
        borderColor: 'border-destructive/50',
      };
    }
    if (isSpeedViolation) {
      return {
        icon: Gauge,
        label: 'EXCESSO DE VELOCIDADE',
        color: 'text-warning',
        bgColor: 'bg-warning/20',
        borderColor: 'border-warning/50',
      };
    }
    return {
      icon: CheckCircle,
      label: 'DENTRO DA ROTA',
      color: 'text-success',
      bgColor: 'bg-success/20',
      borderColor: 'border-success/50',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-[420px]">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Route className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">{mission.name}</h3>
              <p className="text-[10px] text-muted-foreground">
                {vehicle?.device_name || 'Veículo não encontrado'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 px-2 text-xs"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Banner */}
        <div className={`px-4 py-2 ${statusInfo.bgColor} border-b ${statusInfo.borderColor} flex items-center gap-2`}>
          <StatusIcon className={`w-4 h-4 ${statusInfo.color} ${isDeviation || isSpeedViolation ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-semibold tracking-wide ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {isSpeedViolation && vehicle && (
            <span className="text-xs text-warning ml-auto font-mono">
              {vehicle.speed.toFixed(0)} / {mission.maxSpeed} km/h
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-px bg-border">
          {/* Remaining Distance */}
          <div className="bg-card p-4 flex flex-col items-center justify-center">
            <Navigation className="w-4 h-4 text-accent mb-1" />
            <span className="font-display font-bold text-lg">{formatDistance(remainingDistance)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Restante</span>
          </div>

          {/* ETA */}
          <div className="bg-card p-4 flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-accent mb-1" />
            <span className="font-display font-bold text-lg">{formatDuration(eta)}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">ETA</span>
          </div>

          {/* Current Speed */}
          <div className="bg-card p-4 flex flex-col items-center justify-center">
            <Gauge className={`w-4 h-4 mb-1 ${isSpeedViolation ? 'text-warning' : 'text-accent'}`} />
            <span className={`font-display font-bold text-lg ${isSpeedViolation ? 'text-warning' : ''}`}>
              {vehicle?.speed.toFixed(0) || 0}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">km/h</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Monitoramento ativo
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onCancelMission}
            className="h-7 px-3 text-xs"
          >
            Cancelar Missão
          </Button>
        </div>
      </div>
    </div>
  );
}
