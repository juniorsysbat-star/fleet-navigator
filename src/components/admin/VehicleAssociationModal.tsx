import { useState, useEffect } from 'react';
import { X, Car, Check, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/types/user';
import { VehicleWithStatus } from '@/types/vehicle';

interface VehicleAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  vehicles: VehicleWithStatus[];
  currentAssociations: string[];
  onSave: (userId: string, vehicleIds: string[]) => void;
}

export function VehicleAssociationModal({ 
  isOpen, 
  onClose, 
  user, 
  vehicles,
  currentAssociations,
  onSave 
}: VehicleAssociationModalProps) {
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentAssociations) {
      setSelectedVehicles(new Set(currentAssociations));
    }
  }, [isOpen, currentAssociations]);

  if (!isOpen || !user) return null;

  const filteredVehicles = vehicles.filter(v => 
    v.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.device_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleVehicle = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVehicles.size === vehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(vehicles.map(v => v.device_id)));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(user.id, Array.from(selectedVehicles));
    setIsLoading(false);
    onClose();
  };

  const hasChanges = () => {
    const currentSet = new Set(currentAssociations);
    if (selectedVehicles.size !== currentSet.size) return true;
    for (const id of selectedVehicles) {
      if (!currentSet.has(id)) return true;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Associar Veículos</h2>
              <p className="text-xs text-muted-foreground">{user.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar veículo..."
              className="pl-10 bg-muted border-border"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {selectedVehicles.size} de {vehicles.length} selecionados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-7 text-xs"
            >
              {selectedVehicles.size === vehicles.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </Button>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum veículo encontrado
            </div>
          ) : (
            filteredVehicles.map((vehicle) => {
              const isSelected = selectedVehicles.has(vehicle.device_id);
              return (
                <button
                  key={vehicle.device_id}
                  type="button"
                  onClick={() => handleToggleVehicle(vehicle.device_id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-border bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-accent' : ''}`}>
                      {vehicle.device_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {vehicle.device_id}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    vehicle.speed > 5 ? 'bg-success' : vehicle.ignition ? 'bg-warning' : 'bg-muted-foreground'
                  }`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-border shrink-0 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            tc_user_device
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges()}
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
