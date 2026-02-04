import { VehicleWithStatus } from '@/types/vehicle';
import { VehicleCard } from './VehicleCard';
import { 
  Car, 
  Navigation, 
  ParkingCircle, 
  RefreshCw, 
  Activity,
  Search 
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
}: VehicleSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'moving' | 'stopped'>('all');

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.device_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'moving' && vehicle.isMoving) ||
      (filter === 'stopped' && !vehicle.isMoving);
    return matchesSearch && matchesFilter;
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
            <Navigation className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground tracking-wide">
              FLEET TRACKER
            </h1>
            <p className="text-xs text-muted-foreground">Sistema de Rastreamento</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-secondary/50 border border-border text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Car className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">{vehicles.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-success/10 border border-success/30 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="text-lg font-display font-bold text-success">{movingCount}</p>
            <p className="text-[10px] text-success/70 uppercase">Ativos</p>
          </div>
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ParkingCircle className="w-3.5 h-3.5 text-destructive" />
            </div>
            <p className="text-lg font-display font-bold text-destructive">{stoppedCount}</p>
            <p className="text-[10px] text-destructive/70 uppercase">Parados</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar veículo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'moving', label: 'Ativos' },
            { key: 'stopped', label: 'Parados' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
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
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Atualizado: {formatLastUpdate(lastUpdate)}</span>
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
