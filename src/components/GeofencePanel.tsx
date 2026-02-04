import { Geofence } from '@/data/mockGeofences';
import { 
  MapPin, 
  Trash2, 
  Edit2, 
  Power, 
  Bell, 
  BellOff,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GeofencePanelProps {
  geofences: Geofence[];
  isDrawing: boolean;
  onStartDrawing: () => void;
  onCancelDrawing: () => void;
  onDeleteGeofence: (id: string) => void;
  onToggleGeofence: (id: string) => void;
  selectedGeofenceId: string | null;
  onSelectGeofence: (id: string | null) => void;
}

export function GeofencePanel({
  geofences,
  isDrawing,
  onStartDrawing,
  onCancelDrawing,
  onDeleteGeofence,
  onToggleGeofence,
  selectedGeofenceId,
  onSelectGeofence,
}: GeofencePanelProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000] w-80 max-h-[calc(100vh-120px)] flex flex-col bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            <h3 className="font-display font-bold text-foreground">Cercas Virtuais</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            {geofences.length} cercas
          </span>
        </div>

        {isDrawing ? (
          <div className="space-y-2">
            <p className="text-xs text-warning">
              🎯 Clique no mapa para definir os pontos da cerca. Clique no primeiro ponto para fechar.
            </p>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={onCancelDrawing}
            >
              Cancelar Desenho
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full gap-2" 
            onClick={onStartDrawing}
          >
            <Plus className="w-4 h-4" />
            Desenhar Nova Cerca
          </Button>
        )}
      </div>

      {/* Geofence List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-cyber">
        {geofences.length === 0 ? (
          <div className="py-8 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma cerca criada
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em "Desenhar Nova Cerca" para começar
            </p>
          </div>
        ) : (
          geofences.map((geofence) => (
            <div
              key={geofence.id}
              onClick={() => onSelectGeofence(
                selectedGeofenceId === geofence.id ? null : geofence.id
              )}
              className={cn(
                "p-3 rounded-lg border transition-all cursor-pointer",
                selectedGeofenceId === geofence.id
                  ? "bg-secondary/80 border-accent"
                  : "bg-secondary/30 border-border hover:border-accent/50",
                !geofence.isActive && "opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: geofence.color }}
                  />
                  <span className="font-semibold text-sm text-foreground">
                    {geofence.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {geofence.alertOnEnter || geofence.alertOnExit ? (
                    <Bell className="w-3 h-3 text-warning" />
                  ) : (
                    <BellOff className="w-3 h-3 text-muted-foreground" />
                  )}
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    geofence.isActive ? "bg-success" : "bg-muted-foreground"
                  )} />
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-2">
                Criada {formatDistanceToNow(geofence.createdAt, { addSuffix: true, locale: ptBR })}
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                {geofence.alertOnEnter && (
                  <span className="px-2 py-0.5 rounded bg-success/20 text-success">
                    Alerta entrada
                  </span>
                )}
                {geofence.alertOnExit && (
                  <span className="px-2 py-0.5 rounded bg-warning/20 text-warning">
                    Alerta saída
                  </span>
                )}
              </div>

              {selectedGeofenceId === geofence.id && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border animate-fade-in">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleGeofence(geofence.id);
                    }}
                  >
                    <Power className="w-3 h-3" />
                    {geofence.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGeofence(geofence.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
