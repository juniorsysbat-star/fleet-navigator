import { VehicleWithStatus } from '@/types/vehicle';
import { VehicleCard } from './VehicleCard';
import { 
  Car, 
  Navigation, 
  RefreshCw, 
  Activity,
  Search,
  Radio,
  Wifi,
  WifiOff,
  X,
  Minus
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface VehicleSidebarProps {
  vehicles: VehicleWithStatus[];
  selectedVehicleId: string | null;
  onVehicleSelect: (id: string) => void;
  isLoading: boolean;
  lastUpdate: Date | null;
  movingCount: number;
  stoppedCount: number;
  onRefresh: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
}

export function VehicleSidebar({
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
  isLoading,
  lastUpdate,
  movingCount,
  stoppedCount,
  onRefresh,
  onClose,
  onMinimize,
}: VehicleSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'moving' | 'idle' | 'offline'>('all');

  // Calculate counts by status - synchronized with VehicleCard logic
  const movingCountCalc = vehicles.filter(v => v.speed > 0).length;
  const idleCount = vehicles.filter(v => v.ignition === true && v.speed === 0).length;
  const offlineCount = vehicles.filter(v => v.ignition === false).length;

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.device_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'moving') return vehicle.speed > 0;
    if (filter === 'idle') return vehicle.ignition === true && vehicle.speed === 0;
    if (filter === 'offline') return vehicle.ignition === false && vehicle.speed === 0;
    
    return true;
  });

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <aside className="w-80 h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30 relative">
              <Navigation className="w-5 h-5 text-accent" />
              <span className="absolute -top-1 -right-1 w-3 h-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
              </span>
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground tracking-wider">
                COMMAND CENTER
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Fleet Tracking System
              </p>
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
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards - 4 columns */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          <div className="p-2 rounded-lg bg-secondary/50 border border-border text-center">
            <div className="flex items-center justify-center mb-1">
              <Car className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-base font-display font-bold text-foreground">{vehicles.length}</p>
            <p className="text-[8px] text-muted-foreground uppercase">Total</p>
          </div>
          
          <div className="p-2 rounded-lg bg-success/10 border border-success/30 text-center">
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="text-base font-display font-bold text-success">{movingCountCalc}</p>
            <p className="text-[8px] text-success/70 uppercase">Ativos</p>
          </div>
          
          <div className="p-2 rounded-lg bg-warning/10 border border-warning/30 text-center">
            <div className="flex items-center justify-center mb-1">
              <Radio className="w-3.5 h-3.5 text-warning" />
            </div>
            <p className="text-base font-display font-bold text-warning">{idleCount}</p>
            <p className="text-[8px] text-warning/70 uppercase">Parados</p>
          </div>
          
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <div className="flex items-center justify-center mb-1">
              <WifiOff className="w-3.5 h-3.5 text-destructive" />
            </div>
            <p className="text-base font-display font-bold text-destructive">{offlineCount}</p>
            <p className="text-[8px] text-destructive/70 uppercase">Offline</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou placa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-medium"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
          {[
            { key: 'all', label: 'Todos', count: vehicles.length },
          { key: 'moving', label: 'Ativos', count: movingCountCalc },
            { key: 'idle', label: 'Parados', count: idleCount },
            { key: 'offline', label: 'Offline', count: offlineCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wide",
                filter === tab.key
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-cyber">
        {isLoading && vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Carregando veículos...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Car className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum veículo encontrado</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-accent hover:underline mt-2"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.device_id}
              vehicle={vehicle}
              isSelected={selectedVehicleId === vehicle.device_id}
              onClick={() => onVehicleSelect(vehicle.device_id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border bg-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-success" />
              <span className="text-muted-foreground">ONLINE</span>
            </div>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-muted-foreground font-mono text-[10px]">
              {formatLastUpdate(lastUpdate)}
            </span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "p-2 rounded-lg transition-all",
              "bg-secondary/50 hover:bg-secondary border border-border",
              "text-muted-foreground hover:text-accent",
              isLoading && "animate-spin"
            )}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
