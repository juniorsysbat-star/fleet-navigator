import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { VehicleWithStatus } from '@/types/vehicle';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons with status colors
const createCustomIcon = (status: 'moving' | 'idle' | 'offline' | 'unknown') => {
  const colors = {
    moving: { main: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' },
    idle: { main: '#ffcc00', glow: 'rgba(255, 204, 0, 0.5)' },
    offline: { main: '#ff4444', glow: 'rgba(255, 68, 68, 0.5)' },
    unknown: { main: '#666666', glow: 'rgba(102, 102, 102, 0.5)' },
  };
  
  const { main: color, glow: glowColor } = colors[status];
  
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

const getVehicleMarkerStatus = (vehicle: VehicleWithStatus): 'moving' | 'idle' | 'offline' | 'unknown' => {
  if (vehicle.speed > 5) return 'moving';
  if (vehicle.ignition === true || vehicle.speed > 0) return 'idle';
  if (vehicle.ignition === false) return 'offline';
  return 'unknown';
};

interface VehicleMapProps {
  vehicles: VehicleWithStatus[];
  selectedVehicleId: string | null;
  onVehicleSelect: (id: string) => void;
  trailData?: { lat: number; lng: number }[] | null;
}

export function VehicleMap({ 
  vehicles, 
  selectedVehicleId, 
  onVehicleSelect,
  trailData 
}: VehicleMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const createPopupContent = (vehicle: VehicleWithStatus) => {
    const status = getVehicleMarkerStatus(vehicle);
    const statusColors = {
      moving: 'hsl(160, 100%, 45%)',
      idle: 'hsl(50, 100%, 55%)',
      offline: 'hsl(0, 85%, 55%)',
      unknown: 'hsl(220, 15%, 55%)',
    };
    const statusLabels = {
      moving: 'Em movimento',
      idle: 'Parado ligado',
      offline: 'Offline',
      unknown: 'Desconhecido',
    };

    return `
      <div style="min-width: 200px; font-family: 'Rajdhani', sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(180, 100%, 50%)" stroke-width="2">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
          <h3 style="font-family: 'Orbitron', sans-serif; font-weight: 600; font-size: 14px; color: hsl(180, 100%, 95%); margin: 0;">
            ${vehicle.device_name}
          </h3>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColors[status]}"></div>
            <span style="color: ${statusColors[status]}">
              ${statusLabels[status]}
            </span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; color: hsl(220, 15%, 55%);">
            <span style="font-weight: 500;">${vehicle.speed.toFixed(1)} km/h</span>
          </div>
          
          <div style="display: flex; align-items: flex-start; gap: 8px; color: hsl(220, 15%, 55%);">
            <span style="font-size: 11px; line-height: 1.4;">${vehicle.address || 'Endereço não disponível'}</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; color: hsl(220, 15%, 55%);">
            <span style="font-size: 11px;">${formatDate(vehicle.devicetime)}</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; color: hsl(220, 15%, 55%); padding-top: 8px; border-top: 1px solid hsl(220, 30%, 20%);">
            <span style="font-size: 11px; font-family: monospace;">
              ${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}
            </span>
          </div>
        </div>
      </div>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [-15.7801, -47.9292];
    
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;
    const existingMarkers = markersRef.current;
    const currentVehicleIds = new Set(vehicles.map(v => v.device_id));

    // Remove markers for vehicles that no longer exist
    existingMarkers.forEach((marker, id) => {
      if (!currentVehicleIds.has(id)) {
        marker.remove();
        existingMarkers.delete(id);
      }
    });

    // Add or update markers
    vehicles.forEach((vehicle) => {
      const existingMarker = existingMarkers.get(vehicle.device_id);
      const position: L.LatLngExpression = [vehicle.latitude, vehicle.longitude];
      const status = getVehicleMarkerStatus(vehicle);

      if (existingMarker) {
        // Update existing marker position and popup
        existingMarker.setLatLng(position);
        existingMarker.setIcon(createCustomIcon(status));
        existingMarker.getPopup()?.setContent(createPopupContent(vehicle));
      } else {
        // Create new marker
        const marker = L.marker(position, {
          icon: createCustomIcon(status),
        });

        marker.bindPopup(createPopupContent(vehicle), {
          className: 'custom-popup',
        });

        marker.on('click', () => {
          onVehicleSelect(vehicle.device_id);
        });

        marker.addTo(map);
        existingMarkers.set(vehicle.device_id, marker);
      }
    });

    // Center on first vehicle if no vehicles were there before
    if (vehicles.length > 0 && existingMarkers.size === vehicles.length && existingMarkers.size > 0) {
      const firstVehicle = vehicles[0];
      map.setView([firstVehicle.latitude, firstVehicle.longitude], 12, { animate: false });
    }
  }, [vehicles, isMapReady, onVehicleSelect]);

  // Handle selected vehicle change
  useEffect(() => {
    if (!mapRef.current || !selectedVehicleId || !isMapReady) return;

    const selectedVehicle = vehicles.find(v => v.device_id === selectedVehicleId);
    if (selectedVehicle) {
      mapRef.current.flyTo(
        [selectedVehicle.latitude, selectedVehicle.longitude],
        16,
        { duration: 1 }
      );

      // Open popup for selected vehicle
      const marker = markersRef.current.get(selectedVehicleId);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedVehicleId, vehicles, isMapReady]);

  // Handle trail polyline
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Draw new polyline if trail data exists
    if (trailData && trailData.length > 1) {
      const latLngs: L.LatLngExpression[] = trailData.map(p => [p.lat, p.lng]);
      
      const polyline = L.polyline(latLngs, {
        color: '#00bfff',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Add glow effect with shadow polyline
      const shadowPolyline = L.polyline(latLngs, {
        color: '#00bfff',
        weight: 12,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
      });

      shadowPolyline.addTo(map);
      polyline.addTo(map);

      // Add start and end markers
      const startIcon = L.divIcon({
        className: 'trail-marker',
        html: `<div style="width: 12px; height: 12px; background: #00bfff; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #00bfff;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const endIcon = L.divIcon({
        className: 'trail-marker',
        html: `<div style="width: 16px; height: 16px; background: #00ff88; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #00ff88;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker(latLngs[0], { icon: startIcon }).addTo(map);
      L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(map);

      polylineRef.current = polyline;

      // Fit bounds to show entire trail
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [trailData, isMapReady]);

  return (
    <div 
      ref={mapContainerRef} 
      className="h-full w-full"
      style={{ background: 'hsl(220, 20%, 6%)' }}
    />
  );
}
