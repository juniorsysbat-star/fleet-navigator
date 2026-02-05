import { Car, MapPin, Route, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PanelType = 'vehicleList' | 'vehicleDetail' | 'geofence' | 'mission';

interface DockItem {
  id: PanelType;
  icon: React.ElementType;
  label: string;
  hasData: boolean;
}

interface PanelDockProps {
  minimizedPanels: PanelType[];
  onRestorePanel: (panel: PanelType) => void;
  vehicleDetailHasData: boolean;
  missionHasData: boolean;
}

export function PanelDock({
  minimizedPanels,
  onRestorePanel,
  vehicleDetailHasData,
  missionHasData,
}: PanelDockProps) {
  const dockItems: DockItem[] = [
    { id: 'vehicleList', icon: List, label: 'Lista de Veículos', hasData: true },
    { id: 'vehicleDetail', icon: Car, label: 'Detalhes do Veículo', hasData: vehicleDetailHasData },
    { id: 'geofence', icon: MapPin, label: 'Cercas Virtuais', hasData: true },
    { id: 'mission', icon: Route, label: 'Missão Ativa', hasData: missionHasData },
  ];

  const visibleItems = dockItems.filter(item => minimizedPanels.includes(item.id));

  if (visibleItems.length === 0) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1001]">
      <div className="flex items-center gap-2 px-3 py-2 bg-card/95 backdrop-blur-md border border-border rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onRestorePanel(item.id)}
              className={cn(
                "relative h-10 w-10 rounded-full p-0 hover:bg-accent/20 hover:scale-110 transition-all duration-200",
                item.hasData && "ring-2 ring-accent/50"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5 text-accent" />
              {item.hasData && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
              )}
            </Button>
          );
        })}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <span className="text-[10px] text-muted-foreground px-2 font-medium uppercase tracking-wider">
          {visibleItems.length} minimizado{visibleItems.length > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
