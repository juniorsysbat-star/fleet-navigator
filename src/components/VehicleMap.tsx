import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { VehicleWithStatus } from '@/types/vehicle';
import { Car, MapPin, Gauge, Clock, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const createCustomIcon = (isMoving: boolean) => {
  const color = isMoving ? '#00ff88' : '#ff4444';
  const glowColor = isMoving ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: ${glowColor};
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, hsl(220 25% 15%) 0%, hsl(220 30% 10%) 100%);
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px ${glowColor};
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

interface MapCenterProps {
  center: [number, number] | null;
}

function MapCenter({ center }: MapCenterProps) {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (center && (prevCenter.current?.[0] !== center[0] || prevCenter.current?.[1] !== center[1])) {
      map.flyTo(center, 16, { duration: 1 });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

interface VehicleMapProps {
  vehicles: VehicleWithStatus[];
  selectedVehicleId: string | null;
  onVehicleSelect: (id: string) => void;
}

export function VehicleMap({ vehicles, selectedVehicleId, onVehicleSelect }: VehicleMapProps) {
  // Calculate center based on vehicles or default to Brazil
  const defaultCenter: [number, number] = vehicles.length > 0
    ? [vehicles[0].latitude, vehicles[0].longitude]
    : [-15.7801, -47.9292];

  const selectedVehicle = vehicles.find((v) => v.device_id === selectedVehicleId);
  const centerOnVehicle: [number, number] | null = selectedVehicle
    ? [selectedVehicle.latitude, selectedVehicle.longitude]
    : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapCenter center={centerOnVehicle} />
      
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.device_id}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={createCustomIcon(vehicle.isMoving)}
          eventHandlers={{
            click: () => onVehicleSelect(vehicle.device_id),
          }}
        >
          <Popup>
            <div className="min-w-[200px] font-sans">
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-5 h-5 text-neon-cyan" />
                <h3 className="text-base font-display font-semibold text-foreground">
                  {vehicle.device_name}
                </h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${vehicle.isMoving ? 'bg-success' : 'bg-destructive'}`} />
                  <span className={vehicle.isMoving ? 'text-success' : 'text-destructive'}>
                    {vehicle.isMoving ? 'Em movimento' : 'Parado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gauge className="w-4 h-4" />
                  <span>{vehicle.speed.toFixed(1)} km/h</span>
                </div>
                
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-xs leading-tight">{vehicle.address || 'Endereço não disponível'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{formatDate(vehicle.devicetime)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border">
                  <Navigation className="w-4 h-4" />
                  <span className="text-xs font-mono">
                    {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
