import { useState, useEffect } from 'react';
import { Geofence } from '@/data/mockGeofences';
import { 
  MapPin, 
  Trash2, 
  Power, 
  Bell, 
  BellOff,
  Plus,
  X,
  Minus,
  Hexagon,
  Circle,
  Edit3,
  Save,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { DrawingMode } from '@/hooks/useGeofenceDrawing';
export type { DrawingMode };

interface GeofencePanelProps {
  geofences: Geofence[];
  isDrawing: boolean;
  drawingMode: DrawingMode;
  onStartDrawing: (mode: DrawingMode) => void;
  onCancelDrawing: () => void;
  onDeleteGeofence: (id: string) => void;
  onToggleGeofence: (id: string) => void;
  selectedGeofenceId: string | null;
  onSelectGeofence: (id: string | null) => void;
  onEditGeofence: (id: string) => void;
  editingGeofenceId: string | null;
  onSaveGeofence: (id: string, name: string) => void;
  onCancelEdit: () => void;
  pendingGeofence: Geofence | null;
  onSavePendingGeofence: (name: string) => void;
  onCancelPendingGeofence: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
}

export function GeofencePanel({
  geofences,
  isDrawing,
  drawingMode,
  onStartDrawing,
  onCancelDrawing,
  onDeleteGeofence,
  onToggleGeofence,
  selectedGeofenceId,
  onSelectGeofence,
  onEditGeofence,
  editingGeofenceId,
  onSaveGeofence,
  onCancelEdit,
  pendingGeofence,
  onSavePendingGeofence,
  onCancelPendingGeofence,
  onClose,
  onMinimize,
}: GeofencePanelProps) {
  const [newGeofenceName, setNewGeofenceName] = useState(`Nova Cerca ${geofences.length + 1}`);
  const [editName, setEditName] = useState('');

  // Reset name when pending geofence changes
  useEffect(() => {
    if (pendingGeofence) {
      setNewGeofenceName(`Nova Cerca ${geofences.length + 1}`);
    }
  }, [pendingGeofence, geofences.length]);

  // Set edit name when editing starts
  useEffect(() => {
    if (editingGeofenceId) {
      const geofence = geofences.find(g => g.id === editingGeofenceId);
      if (geofence) {
        setEditName(geofence.name);
      }
    }
  }, [editingGeofenceId, geofences]);

  return (
    <div className="absolute top-4 right-4 z-[1000] w-80 max-h-[calc(100vh-120px)] flex flex-col bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            <h3 className="font-display font-bold text-foreground">Cercas Virtuais</h3>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded mr-1">
              {geofences.length}
            </span>
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

        {isDrawing ? (
          <div className="space-y-2">
            <p className="text-xs text-warning flex items-center gap-2">
              {drawingMode === 'polygon' ? (
                <>
                  <Hexagon className="w-4 h-4" />
                  Clique no mapa para definir os pontos. Clique no primeiro ponto para fechar.
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Clique no centro e arraste para definir o raio.
                </>
              )}
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
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Escolha o tipo de cerca:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="gap-2 hover:border-accent/50" 
                onClick={() => onStartDrawing('polygon')}
              >
                <Hexagon className="w-4 h-4" />
                Polígono
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="gap-2 hover:border-accent/50" 
                onClick={() => onStartDrawing('circle')}
              >
                <Circle className="w-4 h-4" />
                Círculo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Geofence (just drawn, needs to be saved) */}
      {pendingGeofence && (
        <div className="p-4 border-b border-border bg-accent/10">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Cerca desenhada!</span>
          </div>
          <div className="space-y-3">
            <Input
              value={newGeofenceName}
              onChange={(e) => setNewGeofenceName(e.target.value)}
              placeholder="Nome da cerca"
              className="bg-muted border-border text-sm"
            />
            <div className="text-xs text-muted-foreground">
              {pendingGeofence.type === 'circle' 
                ? `Raio: ${pendingGeofence.radius?.toFixed(0)}m`
                : `${pendingGeofence.coordinates.length} pontos`
              }
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 gap-1 bg-success hover:bg-success/90"
                onClick={() => {
                  onSavePendingGeofence(newGeofenceName);
                  toast.success('Cerca salva com sucesso!', {
                    description: `"${newGeofenceName}" foi adicionada às suas cercas virtuais.`
                  });
                }}
              >
                <Save className="w-3 h-3" />
                Salvar Cerca
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onCancelPendingGeofence}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

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
                    {editingGeofenceId === geofence.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 text-sm bg-muted border-border"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-sm text-foreground">
                        {geofence.name}
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {geofence.type === 'circle' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {geofence.radius?.toFixed(0)}m
                      </span>
                    )}
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
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border animate-fade-in">
                  {editingGeofenceId === geofence.id ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 gap-1 text-xs bg-success hover:bg-success/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveGeofence(geofence.id, editName);
                          toast.success('Cerca atualizada!');
                        }}
                      >
                        <Save className="w-3 h-3" />
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelEdit();
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditGeofence(geofence.id);
                        }}
                      >
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </Button>
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
                      toast.info('Cerca removida');
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
