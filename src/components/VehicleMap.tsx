 import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { VehicleWithStatus, VehicleType } from '@/types/vehicle';
import { Geofence } from '@/data/mockGeofences';
import { Mission } from '@/types/mission';
 import { Button } from '@/components/ui/button';
 import { TrafficCone, Layers, Crosshair } from 'lucide-react';
 import { Hexagon } from 'lucide-react';
import { getCurrentRoadSpeedLimit } from '@/services/routingService';
import { createVehicleIcon } from './map/vehicleIcons';
import { useGeofenceDrawing, DrawingMode, GeofenceDrawResult } from '@/hooks/useGeofenceDrawing';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Unified status logic - synchronized with VehicleCard
const getVehicleMarkerStatus = (vehicle: VehicleWithStatus): 'moving' | 'idle' | 'offline' | 'unknown' => {
  // Green: Moving (Speed > 0)
  if (vehicle.speed > 0) return 'moving';
  // Yellow: Stopped but online (ignition on, speed = 0)
  if (vehicle.ignition === true && vehicle.speed === 0) return 'idle';
  // Gray: Offline (ignition off)
  if (vehicle.ignition === false) return 'offline';
  return 'unknown';
};

interface VehicleMapProps {
  vehicles: VehicleWithStatus[];
  selectedVehicleId: string | null;
  onVehicleSelect: (id: string) => void;
  trailData?: { lat: number; lng: number }[] | null;
  geofences?: Geofence[];
  pendingGeofence?: Geofence | null;
  isDrawingGeofence?: boolean;
  drawingMode?: DrawingMode;
  onGeofenceDrawn?: (result: GeofenceDrawResult) => void;
  selectedGeofenceId?: string | null;
  editingGeofenceId?: string | null;
  activeMission?: Mission | null;
 showGeofenceButton?: boolean;
 onOpenGeofencePanel?: () => void;
}

export function VehicleMap({ 
  vehicles, 
  selectedVehicleId, 
  onVehicleSelect,
  trailData,
  geofences = [],
  pendingGeofence,
  isDrawingGeofence = false,
  drawingMode = null,
  onGeofenceDrawn,
  selectedGeofenceId,
  editingGeofenceId,
   activeMission,
   showGeofenceButton = false,
   onOpenGeofencePanel
}: VehicleMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const trailMarkersRef = useRef<L.Marker[]>([]);
  const geofenceLayersRef = useRef<Map<string, L.Layer>>(new Map());
  const pendingGeofenceLayerRef = useRef<L.Polygon | L.Circle | null>(null);
  const missionRouteRef = useRef<L.Polyline | null>(null);
  const missionCorridorRef = useRef<L.Polyline | null>(null);
  const missionMarkersRef = useRef<L.Marker[]>([]);
  const trafficLayerRef = useRef<L.TileLayer | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isTrafficEnabled, setIsTrafficEnabled] = useState(false);
  const [shouldFollowVehicle, setShouldFollowVehicle] = useState(false);

  // Toggle traffic layer
  const handleToggleTraffic = useCallback(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    if (isTrafficEnabled) {
      // Remove traffic layer
      if (trafficLayerRef.current) {
        map.removeLayer(trafficLayerRef.current);
        trafficLayerRef.current = null;
      }
      setIsTrafficEnabled(false);
    } else {
      // Add traffic layer using Google Traffic tiles
      // Note: This uses Google's traffic tiles which may have usage limitations
      const trafficLayer = L.tileLayer(
        'https://mt0.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}',
        {
          maxZoom: 19,
          opacity: 0.7,
        }
      );
      trafficLayer.addTo(map);
      trafficLayerRef.current = trafficLayer;
      setIsTrafficEnabled(true);
    }
  }, [isMapReady, isTrafficEnabled]);

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
        </div>
      </div>
    `;
  };

  // Use the geofence drawing hook
  useGeofenceDrawing({
    map: mapRef.current,
    isMapReady,
    isDrawing: isDrawingGeofence,
    drawingMode,
    onGeofenceDrawn,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [-23.5505, -46.6333];
    
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsMapReady(true);
 
    // Disable follow as soon as user interacts with the camera (drag/zoom)
    const handleDragStart = () => {
      setShouldFollowVehicle(false);
    };

    const handleMoveStart = (e: any) => {
      // movestart also fires for programmatic flyTo; only disable on real user input
      if (e?.originalEvent) {
        setShouldFollowVehicle(false);
      }
    };

    const handleZoomStart = (e: any) => {
      // zoomstart can happen programmatically; only disable on user input
      if (e?.originalEvent) {
        setShouldFollowVehicle(false);
      }
    };

    map.on('dragstart', handleDragStart);
    map.on('movestart', handleMoveStart);
    map.on('zoomstart', handleZoomStart);

    return () => {
      map.off('dragstart', handleDragStart);
      map.off('movestart', handleMoveStart);
      map.off('zoomstart', handleZoomStart);
       
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
   }, []);


  // Ref to track if initial centering has been done
  const initialCenterDoneRef = useRef(false);
  
  // Animation refs for smooth marker movement
  const animationFramesRef = useRef<Map<string, number>>(new Map());

  // Smooth marker animation function
  const animateMarkerTo = useCallback((marker: L.Marker, targetLat: number, targetLng: number, duration: number = 1000) => {
    const vehicleId = Array.from(markersRef.current.entries()).find(([_, m]) => m === marker)?.[0];
    if (!vehicleId) return;

    // Cancel any existing animation for this marker
    const existingFrame = animationFramesRef.current.get(vehicleId);
    if (existingFrame) {
      cancelAnimationFrame(existingFrame);
    }

    const startLatLng = marker.getLatLng();
    const startLat = startLatLng.lat;
    const startLng = startLatLng.lng;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentLat = startLat + (targetLat - startLat) * easeProgress;
      const currentLng = startLng + (targetLng - startLng) * easeProgress;
      
      marker.setLatLng([currentLat, currentLng]);
      
      if (progress < 1) {
        const frameId = requestAnimationFrame(animate);
        animationFramesRef.current.set(vehicleId, frameId);
      } else {
        animationFramesRef.current.delete(vehicleId);
      }
    };

    const frameId = requestAnimationFrame(animate);
    animationFramesRef.current.set(vehicleId, frameId);
  }, []);

  // Update markers when vehicles change - with mission speed violation detection
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;
    const existingMarkers = markersRef.current;
    const currentVehicleIds = new Set(vehicles.map(v => v.device_id));

    // Remove markers for vehicles that no longer exist
    existingMarkers.forEach((marker, id) => {
      if (!currentVehicleIds.has(id)) {
        // Cancel any pending animation
        const frameId = animationFramesRef.current.get(id);
        if (frameId) {
          cancelAnimationFrame(frameId);
          animationFramesRef.current.delete(id);
        }
        marker.remove();
        existingMarkers.delete(id);
      }
    });

    // Add or update markers
    vehicles.forEach((vehicle) => {
      const existingMarker = existingMarkers.get(vehicle.device_id);
      
      // Check if this vehicle is speeding (if in active mission)
      let markerStatus: 'moving' | 'idle' | 'offline' | 'unknown' | 'speeding' = getVehicleMarkerStatus(vehicle);
      
      if (activeMission && vehicle.device_id === activeMission.vehicleId) {
        // Check against road speed limit
        const vehiclePosition = { lat: vehicle.latitude, lng: vehicle.longitude };
        const roadSpeed = getCurrentRoadSpeedLimit(
          vehiclePosition,
          activeMission.routeCoordinates,
          activeMission.routeSpeedLimits
        );
        
        if (vehicle.speed > roadSpeed.maxSpeed) {
          markerStatus = 'speeding';
        }
      }

      if (existingMarker) {
        // Animate to new position instead of teleporting
        animateMarkerTo(existingMarker, vehicle.latitude, vehicle.longitude, 800);
        existingMarker.setIcon(createVehicleIcon(
          markerStatus, 
          vehicle.vehicleType || 'sedan',
          vehicle.iconColor
        ));
        existingMarker.getPopup()?.setContent(createPopupContent(vehicle));
      } else {
        // Create new marker
        const marker = L.marker([vehicle.latitude, vehicle.longitude], {
          icon: createVehicleIcon(
            markerStatus,
            vehicle.vehicleType || 'sedan',
            vehicle.iconColor
          ),
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

    // Center on vehicles ONLY on first load
    if (!initialCenterDoneRef.current && vehicles.length > 0) {
      const bounds = L.latLngBounds(vehicles.map(v => [v.latitude, v.longitude] as L.LatLngTuple));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      initialCenterDoneRef.current = true;
    }
  }, [vehicles, isMapReady, onVehicleSelect, activeMission, animateMarkerTo]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      animationFramesRef.current.forEach(frameId => cancelAnimationFrame(frameId));
      animationFramesRef.current.clear();
    };
  }, []);

  // Selected vehicle changes: do NOT move the camera automatically.
  // Only open the popup and reset follow state.
  useEffect(() => {
    setShouldFollowVehicle(false);

    if (!mapRef.current || !selectedVehicleId || !isMapReady) return;

    const marker = markersRef.current.get(selectedVehicleId);
    if (marker) {
      marker.openPopup();
    }
  }, [selectedVehicleId, isMapReady]);

  // Vehicle follow controller: ONLY move the camera when shouldFollowVehicle === true
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    if (!selectedVehicleId || !shouldFollowVehicle) return;

    const selectedVehicle = vehicles.find(v => v.device_id === selectedVehicleId);
    if (!selectedVehicle) return;

    mapRef.current.flyTo(
      [selectedVehicle.latitude, selectedVehicle.longitude],
      16,
      { duration: 0.8 }
    );
  }, [selectedVehicleId, vehicles, shouldFollowVehicle, isMapReady]);

  // Handle trail polyline
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    // Remove existing trail
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    trailMarkersRef.current.forEach(m => m.remove());
    trailMarkersRef.current = [];

    // Draw new trail
    if (trailData && trailData.length > 1) {
      const latLngs: L.LatLngExpression[] = trailData.map(p => [p.lat, p.lng]);
      
      // Shadow polyline for glow
      L.polyline(latLngs, {
        color: '#00bfff',
        weight: 12,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const polyline = L.polyline(latLngs, {
        color: '#00bfff',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Start marker
      const startMarker = L.marker(latLngs[0], {
        icon: L.divIcon({
          className: 'trail-marker',
          html: `<div style="width: 12px; height: 12px; background: #00bfff; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #00bfff;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      }).addTo(map);

      // End marker
      const endMarker = L.marker(latLngs[latLngs.length - 1], {
        icon: L.divIcon({
          className: 'trail-marker',
          html: `<div style="width: 16px; height: 16px; background: #00ff88; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #00ff88;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(map);

      trailMarkersRef.current = [startMarker, endMarker];
      polylineRef.current = polyline;

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [trailData, isMapReady]);

  // Handle geofences display
  useEffect(() => {
     if (!mapRef.current || !isMapReady) return;

     const map = mapRef.current;
     const existingLayers = geofenceLayersRef.current;
    const currentIds = new Set(geofences.map(g => g.id));

    // Remove old geofences
    existingLayers.forEach((layer, id) => {
      if (!currentIds.has(id)) {
        layer.remove();
        existingLayers.delete(id);
      }
    });

    // Add or update geofences
    geofences.forEach((geofence) => {
       const existingLayer = existingLayers.get(geofence.id);
      
      if (existingLayer) {
        existingLayer.remove();
        existingLayers.delete(geofence.id);
      }

      if (geofence.isActive || selectedGeofenceId === geofence.id) {
        let layer: L.Polygon | L.Circle;
        
        // Create circle or polygon based on type
        if (geofence.type === 'circle' && geofence.center && geofence.radius) {
          layer = L.circle(
            [geofence.center.lat, geofence.center.lng],
            {
              radius: geofence.radius,
              color: geofence.color,
              weight: selectedGeofenceId === geofence.id ? 3 : 2,
              fillColor: geofence.color,
              fillOpacity: selectedGeofenceId === geofence.id ? 0.3 : 0.15,
              dashArray: geofence.isActive ? undefined : '5, 10',
            }
          ).addTo(map);
        } else {
          layer = L.polygon(
            geofence.coordinates.map(c => [c.lat, c.lng] as L.LatLngExpression),
            {
              color: geofence.color,
              weight: selectedGeofenceId === geofence.id ? 3 : 2,
              fillColor: geofence.color,
              fillOpacity: selectedGeofenceId === geofence.id ? 0.3 : 0.15,
              dashArray: geofence.isActive ? undefined : '5, 10',
            }
          ).addTo(map);
        }

        layer.bindPopup(`
          <div style="font-family: 'Rajdhani', sans-serif;">
            <h3 style="font-family: 'Orbitron', sans-serif; font-weight: 600; margin: 0 0 8px 0; color: ${geofence.color};">
              ${geofence.name}
            </h3>
            <p style="margin: 0; font-size: 12px; color: hsl(220, 15%, 55%);">
              ${geofence.isActive ? '✅ Ativa' : '⏸️ Inativa'}
              ${geofence.type === 'circle' ? ` • Raio: ${geofence.radius?.toFixed(0)}m` : ''}
            </p>
          </div>
        `);

        existingLayers.set(geofence.id, layer);

        // Fly to selected geofence
        if (selectedGeofenceId === geofence.id) {
          map.fitBounds(layer.getBounds(), { padding: [50, 50] });
        }
      }
    });
  }, [geofences, selectedGeofenceId, isMapReady]);

  // Handle pending geofence display (before user saves)
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    // Clear existing pending layer
    if (pendingGeofenceLayerRef.current) {
      pendingGeofenceLayerRef.current.remove();
      pendingGeofenceLayerRef.current = null;
    }

    if (pendingGeofence) {
      let layer: L.Polygon | L.Circle;
      
      if (pendingGeofence.type === 'circle' && pendingGeofence.center && pendingGeofence.radius) {
        layer = L.circle(
          [pendingGeofence.center.lat, pendingGeofence.center.lng],
          {
            radius: pendingGeofence.radius,
            color: pendingGeofence.color,
            weight: 3,
            fillColor: pendingGeofence.color,
            fillOpacity: 0.3,
            dashArray: '10, 5',
          }
        ).addTo(map);
      } else if (pendingGeofence.coordinates.length > 0) {
        layer = L.polygon(
          pendingGeofence.coordinates.map(c => [c.lat, c.lng] as L.LatLngExpression),
          {
            color: pendingGeofence.color,
            weight: 3,
            fillColor: pendingGeofence.color,
            fillOpacity: 0.3,
            dashArray: '10, 5',
          }
        ).addTo(map);
      } else {
        return;
      }

      pendingGeofenceLayerRef.current = layer;

      // Fly to the pending geofence
      map.fitBounds(layer.getBounds(), { padding: [50, 50] });
    }
  }, [pendingGeofence, isMapReady]);

  // Handle mission route display
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    // Clear existing mission layers
    if (missionRouteRef.current) {
      missionRouteRef.current.remove();
      missionRouteRef.current = null;
    }
    if (missionCorridorRef.current) {
      missionCorridorRef.current.remove();
      missionCorridorRef.current = null;
    }
    missionMarkersRef.current.forEach(m => m.remove());
    missionMarkersRef.current = [];

    if (!activeMission || activeMission.routeCoordinates.length < 2) return;

    const latLngs: L.LatLngExpression[] = activeMission.routeCoordinates.map(
      p => [p.lat, p.lng]
    );

    // Draw corridor (glow effect)
    const corridor = L.polyline(latLngs, {
      color: '#00ffff',
      weight: 24,
      opacity: 0.15,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    missionCorridorRef.current = corridor;

    // Draw main route
    const route = L.polyline(latLngs, {
      color: '#00ffff',
      weight: 4,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    missionRouteRef.current = route;

    // Draw animated dashes on top
    L.polyline(latLngs, {
      color: '#ffffff',
      weight: 2,
      opacity: 0.5,
      dashArray: '10, 20',
      lineCap: 'round',
    }).addTo(map);

    // Origin marker
    const originMarker = L.marker([activeMission.origin.lat, activeMission.origin.lng], {
      icon: L.divIcon({
        className: 'mission-marker',
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background: #00ff88; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 15px #00ff88;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(map);
    originMarker.bindPopup(`<strong>Origem</strong><br/>${activeMission.origin.name.split(',').slice(0, 2).join(',')}`);

    // Destination marker
    const destMarker = L.marker([activeMission.destination.lat, activeMission.destination.lng], {
      icon: L.divIcon({
        className: 'mission-marker',
        html: `
          <div style="
            width: 28px; 
            height: 28px; 
            background: #ff4444; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 15px #ff4444;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    }).addTo(map);
    destMarker.bindPopup(`<strong>Destino</strong><br/>${activeMission.destination.name.split(',').slice(0, 2).join(',')}`);

    missionMarkersRef.current = [originMarker, destMarker];

    // Fit bounds to show entire route
    map.fitBounds(route.getBounds(), { padding: [80, 80] });

  }, [activeMission, isMapReady]);

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="h-full w-full"
        style={{ background: 'hsl(220, 20%, 6%)' }}
      />

      {/* Traffic Layer Toggle Button */}
      <div className="absolute top-4 right-4 z-[1000]">
         <div className="flex items-center gap-2">
           {showGeofenceButton && onOpenGeofencePanel && (
             <Button
               variant="outline"
               size="sm"
               onClick={onOpenGeofencePanel}
               className="gap-2 backdrop-blur-sm bg-card/90 hover:bg-card border-border hover:border-accent/50 transition-all duration-200"
               title="Abrir painel de Cercas Virtuais"
             >
               <Hexagon className="w-4 h-4 text-muted-foreground" />
               <span className="text-xs font-medium">Cercas</span>
             </Button>
           )}
        <Button
          variant={isTrafficEnabled ? "default" : "outline"}
          size="sm"
          onClick={handleToggleTraffic}
          className={`gap-2 backdrop-blur-sm ${
            isTrafficEnabled 
              ? 'bg-warning/90 hover:bg-warning text-warning-foreground border-warning' 
              : 'bg-card/90 hover:bg-card border-border'
          }`}
        >
          <TrafficCone className={`w-4 h-4 ${isTrafficEnabled ? '' : 'text-muted-foreground'}`} />
          <span className="text-xs font-medium">
            {isTrafficEnabled ? 'Tráfego ON' : 'Tráfego'}
          </span>
          <Layers className={`w-3 h-3 ${isTrafficEnabled ? 'animate-pulse' : 'text-muted-foreground'}`} />
        </Button>
         </div>
      </div>
 
     {/* Recenter Button - Only shows when following a vehicle but map was moved */}
      {selectedVehicleId && !shouldFollowVehicle && (
        <div className="absolute bottom-6 right-4 z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShouldFollowVehicle(true)}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/30"
            title="Seguir veículo (centraliza e acompanha atualizações)"
          >
            <Crosshair className="w-4 h-4" />
            <span className="text-xs font-medium">Seguir veículo</span>
          </Button>
        </div>
      )}
    </div>
  );
}
