import { useState } from 'react';
import { X, MapPin, Navigation, Gauge, Route, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { VehicleWithStatus } from '@/types/vehicle';
import { Mission } from '@/types/mission';
import { geocodeAddress, calculateRoute } from '@/services/routingService';

interface MissionPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleWithStatus[];
  onMissionCreated: (mission: Mission) => void;
}

export function MissionPlannerModal({ 
  isOpen, 
  onClose, 
  vehicles,
  onMissionCreated 
}: MissionPlannerModalProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [maxSpeed, setMaxSpeed] = useState(80);
  const [corridorWidth, setCorridorWidth] = useState(500);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateMission = async () => {
    if (!origin || !destination || !selectedVehicleId) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Geocode origin and destination
      const [originGeo, destGeo] = await Promise.all([
        geocodeAddress(origin),
        geocodeAddress(destination),
      ]);

      if (!originGeo) {
        setError('Não foi possível encontrar o endereço de origem');
        setIsLoading(false);
        return;
      }

      if (!destGeo) {
        setError('Não foi possível encontrar o endereço de destino');
        setIsLoading(false);
        return;
      }

      // Calculate route
      const routeInfo = await calculateRoute(
        { lat: originGeo.lat, lng: originGeo.lng },
        { lat: destGeo.lat, lng: destGeo.lng }
      );

      if (!routeInfo) {
        setError('Não foi possível calcular a rota');
        setIsLoading(false);
        return;
      }

      const mission: Mission = {
        id: `mission-${Date.now()}`,
        name: `${origin.split(',')[0]} → ${destination.split(',')[0]}`,
        origin: { lat: originGeo.lat, lng: originGeo.lng, name: originGeo.displayName },
        destination: { lat: destGeo.lat, lng: destGeo.lng, name: destGeo.displayName },
        vehicleId: selectedVehicleId,
        maxSpeed,
        corridorWidth,
        routeCoordinates: routeInfo.coordinates,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        status: 'active',
        createdAt: new Date(),
      };

      onMissionCreated(mission);
      onClose();
      
      // Reset form
      setOrigin('');
      setDestination('');
      setSelectedVehicleId('');
      setMaxSpeed(80);
      setCorridorWidth(500);
    } catch (err) {
      setError('Erro ao criar missão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Route className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Nova Missão</h2>
              <p className="text-xs text-muted-foreground">Planejador de Rotas Inteligente</p>
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Veículo</Label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">Selecione um veículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.device_id} value={vehicle.device_id}>
                  {vehicle.device_name}
                </option>
              ))}
            </select>
          </div>

          {/* Origin */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-success" />
              Origem
            </Label>
            <Input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ex: Indaial, SC"
              className="bg-muted border-border"
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Navigation className="w-4 h-4 text-destructive" />
              Destino
            </Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: Americana, SP"
              className="bg-muted border-border"
            />
          </div>

          {/* Compliance Settings */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-accent">
              <Gauge className="w-4 h-4" />
              Regras de Compliance
            </h3>

            {/* Max Speed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Velocidade Máxima</Label>
                <span className="text-sm font-mono font-semibold text-warning">{maxSpeed} km/h</span>
              </div>
              <Slider
                value={[maxSpeed]}
                onValueChange={(value) => setMaxSpeed(value[0])}
                min={40}
                max={120}
                step={5}
                className="w-full"
              />
            </div>

            {/* Corridor Width */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Largura do Corredor</Label>
                <span className="text-sm font-mono font-semibold text-accent">{corridorWidth}m</span>
              </div>
              <Slider
                value={[corridorWidth]}
                onValueChange={(value) => setCorridorWidth(value[0])}
                min={100}
                max={1000}
                step={50}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">
                Alerta de desvio será acionado se o veículo sair deste raio
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateMission}
            disabled={isLoading || !origin || !destination || !selectedVehicleId}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Route className="w-4 h-4" />
                Criar Missão
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
