import { VehicleWithStatus } from '@/types/vehicle';
import { getStatusColor } from '@/types/vehicle';
import { VehicleCard } from './VehicleCard';
import { 
  Car, 
  Navigation, 
  RefreshCw, 
  Search,
  Wifi,
  WifiOff,
  X,
  Minus,
  AlertTriangle
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
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'alert'>('all');

  // Calculate counts by simplified triad status
  const alertCount = vehicles.filter(v => getStatusColor(v) === 'bg-red-500').length;
  const offlineCount = vehicles.filter(v => getStatusColor(v) === 'bg-gray-400').length;
  const onlineCount = vehicles.filter(v => getStatusColor(v) === 'bg-emerald-500').length;

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.device_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    
    const statusColor = getStatusColor(vehicle);
    if (filter === 'online') return statusColor === 'bg-emerald-500';
    if (filter === 'offline') return statusColor === 'bg-gray-400';
    if (filter === 'alert') return statusColor === 'bg-red-500';
    
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
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Online - Green */}
          <button
            onClick={() => setFilter(filter === 'online' ? 'all' : 'online')}
            className={cn(
              "p-2.5 rounded-lg border text-center transition-all cursor-pointer",
              filter === 'online'
                ? "bg-emerald-500/20 border-emerald-500"
                : "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15"
            )}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-display font-bold text-emerald-500">{onlineCount}</p>
            <p className="text-[9px] text-emerald-500/70 uppercase font-semibold">Online</p>
          </button>
          
          {/* Offline - Gray */}
          <button
            onClick={() => setFilter(filter === 'offline' ? 'all' : 'offline')}
            className={cn(
              "p-2.5 rounded-lg border text-center transition-all cursor-pointer",
              filter === 'offline'
                ? "bg-gray-400/20 border-gray-400"
                : "bg-gray-400/10 border-gray-400/30 hover:bg-gray-400/15"
            )}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <WifiOff className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <p className="text-lg font-display font-bold text-gray-400">{offlineCount}</p>
            <p className="text-[9px] text-gray-400/70 uppercase font-semibold">Offline</p>
          </button>
          
          {/* Alert - Red */}
          <button
            onClick={() => setFilter(filter === 'alert' ? 'all' : 'alert')}
            className={cn(
              "p-2.5 rounded-lg border text-center transition-all cursor-pointer",
              filter === 'alert'
                ? "bg-red-500/20 border-red-500"
                : "bg-red-500/10 border-red-500/30 hover:bg-red-500/15",
              alertCount > 0 && "animate-pulse"
            )}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className={cn("w-2 h-2 rounded-full bg-red-500", alertCount > 0 && "animate-ping")} />
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <p className="text-lg font-display font-bold text-red-500">{alertCount}</p>
            <p className="text-[9px] text-red-500/70 uppercase font-semibold">Alerta</p>
          </button>
        </div>

        {/* Total count badge */}
        <div className="flex items-center justify-center gap-2 mb-3 py-1.5 px-3 bg-secondary/30 rounded-lg">
          <Car className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">{vehicles.length}</span>
          <span className="text-xs text-muted-foreground">veículos na frota</span>
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

        {/* Filter indicator */}
        {filter !== 'all' && (
          <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-accent/10 rounded-lg border border-accent/30">
            <span className="text-xs font-semibold text-accent">
              Filtrando: {filter === 'online' ? 'Online' : filter === 'offline' ? 'Offline' : 'Alertas'}
            </span>
            <button
              onClick={() => setFilter('all')}
              className="text-xs text-accent hover:underline font-medium"
            >
              Limpar
            </button>
          </div>
        )}
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
