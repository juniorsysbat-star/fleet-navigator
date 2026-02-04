import { useEffect, useState } from 'react';
import { Navigation, Clock, Route, AlertTriangle, CheckCircle, XCircle, Gauge, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Mission } from '@/types/mission';
import { VehicleWithStatus } from '@/types/vehicle';
import { getDistanceToRoute, getRemainingDistance, haversineDistance, getCurrentRoadSpeedLimit } from '@/services/routingService';

interface MissionTrackerProps {
  mission: Mission;
  vehicle: VehicleWithStatus | undefined;
  onClose: () => void;
  onCancelMission: () => void;
}

interface RoadSpeedInfo {
  limit: number;
  roadName?: string;
  isExceeding: boolean;
  excessAmount: number;
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
  const [roadSpeedInfo, setRoadSpeedInfo] = useState<RoadSpeedInfo>({
    limit: 60,
    isExceeding: false,
    excessAmount: 0,
  });

  useEffect(() => {
    if (!vehicle || mission.routeCoordinates.length === 0) return;

    const vehiclePosition = { lat: vehicle.latitude, lng: vehicle.longitude };
    
    // Check deviation from route corridor
    const distanceToRoute = getDistanceToRoute(vehiclePosition, mission.routeCoordinates);
    setIsDeviation(distanceToRoute > mission.corridorWidth);

    // Get current road speed limit from OSM data
    const roadSpeed = getCurrentRoadSpeedLimit(
      vehiclePosition,
      mission.routeCoordinates,
      mission.routeSpeedLimits
    );

    // Check if exceeding ROAD speed limit (Smart Speed feature)
    const isExceedingRoadLimit = vehicle.speed > roadSpeed.maxSpeed;
    const excessAmount = isExceedingRoadLimit ? Math.round(vehicle.speed - roadSpeed.maxSpeed) : 0;
    
    setRoadSpeedInfo({
      limit: roadSpeed.maxSpeed,
      roadName: roadSpeed.roadName,
      isExceeding: isExceedingRoadLimit,
      excessAmount,
    });

    // Check global speed violation (mission max speed)
    setIsSpeedViolation(vehicle.speed > mission.maxSpeed || isExceedingRoadLimit);

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
    if (roadSpeedInfo.isExceeding) {
      return {
        icon: Zap,
        label: `EXCESSO (+${roadSpeedInfo.excessAmount}km/h)`,
        color: 'text-destructive',
        bgColor: 'bg-destructive/20',
        borderColor: 'border-destructive/50',
      };
    }
    if (isSpeedViolation) {
      return {
        icon: Gauge,
        label: 'VELOCIDADE ACIMA DO LIMITE',
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
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-[480px]">
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
          {roadSpeedInfo.isExceeding && vehicle && (
            <span className="text-xs text-destructive ml-auto font-mono">
              Via: {roadSpeedInfo.limit} km/h {roadSpeedInfo.roadName && `• ${roadSpeedInfo.roadName.slice(0, 20)}`}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-px bg-border">
          {/* Remaining Distance */}
          <div className="bg-card p-3 flex flex-col items-center justify-center">
            <Navigation className="w-4 h-4 text-accent mb-1" />
            <span className="font-display font-bold text-base">{formatDistance(remainingDistance)}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Restante</span>
          </div>

          {/* ETA */}
          <div className="bg-card p-3 flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-accent mb-1" />
            <span className="font-display font-bold text-base">{formatDuration(eta)}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">ETA</span>
          </div>

          {/* Current Speed */}
          <div className="bg-card p-3 flex flex-col items-center justify-center">
            <Gauge className={`w-4 h-4 mb-1 ${roadSpeedInfo.isExceeding ? 'text-destructive' : 'text-accent'}`} />
            <span className={`font-display font-bold text-base ${roadSpeedInfo.isExceeding ? 'text-destructive' : ''}`}>
              {vehicle?.speed.toFixed(0) || 0}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">km/h</span>
          </div>

          {/* Road Speed Limit */}
          <div className={`bg-card p-3 flex flex-col items-center justify-center ${roadSpeedInfo.isExceeding ? 'bg-destructive/10' : ''}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold mb-1 ${
              roadSpeedInfo.isExceeding 
                ? 'border-destructive text-destructive animate-pulse' 
                : 'border-warning text-warning'
            }`}>
              {roadSpeedInfo.limit}
            </div>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Limite Via</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Monitoramento ativo</span>
            {roadSpeedInfo.roadName && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-accent truncate max-w-[150px]">{roadSpeedInfo.roadName}</span>
              </>
            )}
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
