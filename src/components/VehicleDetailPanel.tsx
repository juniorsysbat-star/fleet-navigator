import { VehicleWithStatus } from '@/types/vehicle';
import { 
  X, 
  Gauge, 
  MapPin, 
  Clock, 
  Zap, 
  Battery, 
  Route, 
  Lock,
  Navigation,
  Rocket,
  Minus,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { DeviceModal, DeviceFormData } from '@/components/admin/DeviceModal';
 import { getVehicleIcon } from '@/utils/vehicleIcons';
 import { getStatusVisual } from '@/types/vehicle';
 import { TrailHistoryModal } from './TrailHistoryModal';
 import { TrailPoint } from '@/data/mockTrailHistory';

interface VehicleDetailPanelProps {
  vehicle: VehicleWithStatus | null;
  onClose: () => void;
   onShowTrail: (vehicleId: string, trail?: TrailPoint[]) => void;
  isTrailVisible: boolean;
  onOpenMissionPlanner: () => void;
  onMinimize?: () => void;
  onVehicleUpdate?: (device: DeviceFormData) => void;
}

export function VehicleDetailPanel({ 
  vehicle, 
  onClose, 
  onShowTrail,
  isTrailVisible,
  onOpenMissionPlanner,
  onMinimize,
  onVehicleUpdate,
}: VehicleDetailPanelProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isTrailHistoryOpen, setIsTrailHistoryOpen] = useState(false);

  if (!vehicle) return null;

  const handleBlockVehicle = () => {
    console.log(`🚫 Bloqueio solicitado para: ${vehicle.device_name} (ID: ${vehicle.device_id})`);
    console.log('⚠️ Esta é uma ação simulada - nenhum veículo foi realmente bloqueado.');
  };

  // Usar lógica unificada de status
  const { bgClass, textClass, borderClass, statusLabel } = getStatusVisual(vehicle);
  const isAlert = Boolean(vehicle.blocked || vehicle.alarm || vehicle.alert);
  
  const timeAgo = formatDistanceToNow(new Date(vehicle.devicetime), { 
    addSuffix: true, 
    locale: ptBR 
  });

  // Simulated values
  const batteryLevel = vehicle.batteryLevel ?? Math.floor(Math.random() * 40) + 60;
  const ignitionStatus = vehicle.ignition ?? vehicle.speed > 0;

  // Convert vehicle to DeviceFormData for editing
  const vehicleToFormData = (): DeviceFormData => ({
    id: vehicle.device_id,
    name: vehicle.device_name,
    plate: vehicle.device_name,
    imei: vehicle.device_id,
    model: '',
    manufacturerId: '',
    modelId: '',
    port: 5023,
    simPhone: '',
    vehicleType: vehicle.vehicleType || 'sedan',
    iconColor: vehicle.iconColor || 'status',
    ipvaExpiry: vehicle.documentation?.ipvaExpiry,
    insuranceExpiry: vehicle.documentation?.insuranceExpiry,
    licensingExpiry: vehicle.documentation?.licensingExpiry,
    trailers: vehicle.documentation?.trailers,
  });

  const handleSaveVehicle = (device: DeviceFormData) => {
    if (onVehicleUpdate) {
      onVehicleUpdate(device);
    }
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="w-96 h-full bg-sidebar border-l border-sidebar-border flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
             <div 
               className={cn(
                 "w-10 h-10 rounded-lg flex items-center justify-center border-2",
                 borderClass,
                 bgClass + "/10",
                 isAlert && "animate-pulse"
               )}
               style={{
                 boxShadow: isAlert ? '0 0 15px rgba(239, 68, 68, 0.8)' : undefined
               }}
             >
               <span className={textClass}>
                 {getVehicleIcon({ type: vehicle.vehicleType, className: "w-5 h-5" })}
               </span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                {vehicle.device_name}
              </h2>
              <div className="flex items-center gap-2">
                 <span className={cn("w-2 h-2 rounded-full", bgClass)} />
                 <span className={cn("text-xs font-medium", textClass)}>
                   {statusLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
                title="Minimizar"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Edit Vehicle Button */}
        <Button
          onClick={() => setIsEditModalOpen(true)}
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs border-accent/30 text-accent hover:bg-accent/10"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar Veículo
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-cyber">
        {/* Speedometer */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/80 to-card border border-border">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Outer ring */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={vehicle.speed > 80 ? "hsl(var(--destructive))" : vehicle.speed > 0 ? "hsl(var(--success))" : "hsl(var(--muted-foreground))"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(vehicle.speed / 150) * 440} 440`}
                  className="transition-all duration-500"
                  style={{
                    filter: vehicle.speed > 0 ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                  }}
                />
              </svg>
              
              {/* Speed value */}
              <div className="text-center z-10">
                <span className="font-display text-5xl font-bold text-foreground tabular-nums">
                  {Math.round(vehicle.speed)}
                </span>
                <p className="text-sm text-muted-foreground font-medium mt-1">km/h</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Gauge className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                Velocidade Atual
              </span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Endereço</p>
              <p className="text-sm text-foreground leading-relaxed">
                {vehicle.address || 'Endereço não disponível'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Última Atualização</p>
              <p className="text-sm text-foreground capitalize">{timeAgo}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(vehicle.devicetime).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Navigation className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Coordenadas</p>
              <p className="text-sm text-foreground font-mono">
                {vehicle.latitude.toFixed(6)}, {vehicle.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Ignition */}
          <div className={cn(
            "p-4 rounded-xl border transition-all",
            ignitionStatus 
              ? "bg-success/10 border-success/30" 
              : "bg-secondary/50 border-border"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className={cn(
                "w-5 h-5",
                ignitionStatus ? "text-success" : "text-muted-foreground"
              )} />
              <span className="text-xs text-muted-foreground">Ignição</span>
            </div>
            <p className={cn(
              "font-display font-bold text-lg",
              ignitionStatus ? "text-success" : "text-muted-foreground"
            )}>
              {ignitionStatus ? 'LIGADA' : 'DESLIGADA'}
            </p>
          </div>

          {/* Battery */}
          <div className={cn(
            "p-4 rounded-xl border transition-all",
            batteryLevel > 30 
              ? "bg-accent/10 border-accent/30" 
              : "bg-destructive/10 border-destructive/30"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Battery className={cn(
                "w-5 h-5",
                batteryLevel > 30 ? "text-accent" : "text-destructive"
              )} />
              <span className="text-xs text-muted-foreground">Bateria</span>
            </div>
            <p className={cn(
              "font-display font-bold text-lg",
              batteryLevel > 30 ? "text-accent" : "text-destructive"
            )}>
              {batteryLevel}%
            </p>
          </div>
        </div>

       {/* Trail Buttons */}
       <div className="space-y-2">
         <Button
           onClick={() => setIsTrailHistoryOpen(true)}
           variant="outline"
           className="w-full gap-2 font-semibold border-accent/50 text-accent hover:bg-accent/10"
         >
           <Route className="w-4 h-4" />
           Ver Histórico de Trajeto
         </Button>
         
         {isTrailVisible && (
           <Button
             onClick={() => onShowTrail(vehicle.device_id)}
             variant="destructive"
             size="sm"
             className="w-full gap-2 text-xs"
           >
             Ocultar Trajeto
           </Button>
         )}
       </div>

        {/* Mission Planner Button */}
        <Button
          onClick={onOpenMissionPlanner}
          variant="outline"
         className="w-full gap-2 font-semibold border-accent/50 text-accent hover:bg-accent/10"
        >
          <Rocket className="w-4 h-4" />
          Nova Missão
        </Button>
      </div>

      {/* Footer - Block Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleBlockVehicle}
          variant="destructive"
          className="w-full gap-2 font-semibold"
        >
          <Lock className="w-4 h-4" />
          Bloquear Veículo
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          ⚠️ Ação irreversível - Use com cautela
        </p>
      </div>
      </div>

      {/* Edit Vehicle Modal */}
      <DeviceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveVehicle}
        editDevice={vehicleToFormData()}
      />
 
     {/* Trail History Modal */}
     <TrailHistoryModal
       isOpen={isTrailHistoryOpen}
       onClose={() => setIsTrailHistoryOpen(false)}
       vehicle={vehicle}
       onTrailLoad={(trail) => {
         onShowTrail(vehicle.device_id, trail);
         setIsTrailHistoryOpen(false);
       }}
     />
    </>
  );
}
