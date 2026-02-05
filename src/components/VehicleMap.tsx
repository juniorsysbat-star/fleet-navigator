 import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { VehicleWithStatus, VehicleType } from '@/types/vehicle';
import { Geofence } from '@/data/mockGeofences';
import { Mission } from '@/types/mission';
 import { Button } from '@/components/ui/button';
 import { TrafficCone, Layers, Crosshair } from 'lucide-react';
import { getCurrentRoadSpeedLimit } from '@/services/routingService';
import { createVehicleIcon } from './map/vehicleIcons';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
  geofences?: Geofence[];
  isDrawingGeofence?: boolean;
  onGeofenceDrawn?: (coordinates: { lat: number; lng: number }[]) => void;
  selectedGeofenceId?: string | null;
  activeMission?: Mission | null;
}

export function VehicleMap({ 
  vehicles, 
  selectedVehicleId, 
  onVehicleSelect,
  trailData,
  geofences = [],
  isDrawingGeofence = false,
  onGeofenceDrawn,
  selectedGeofenceId,
  activeMission
}: VehicleMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const trailMarkersRef = useRef<L.Marker[]>([]);
  const geofenceLayersRef = useRef<Map<string, L.Polygon>>(new Map());
  const drawingPointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const drawingLayerRef = useRef<L.Polygon | null>(null);
  const drawingMarkersRef = useRef<L.Marker[]>([]);
  const missionRouteRef = useRef<L.Polyline | null>(null);
  const missionCorridorRef = useRef<L.Polyline | null>(null);
  const missionMarkersRef = useRef<L.Marker[]>([]);
  const trafficLayerRef = useRef<L.TileLayer | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isTrafficEnabled, setIsTrafficEnabled] = useState(false);
   const [userHasInteracted, setUserHasInteracted] = useState(false);
   const [showRecenterButton, setShowRecenterButton] = useState(false);
   
   // Track the last time user selected a vehicle (to force center)
   const lastVehicleSelectionRef = useRef<string | null>(null);
   const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 
   // Check if map is centered on selected vehicle
   const checkIfCenteredOnVehicle = useCallback(() => {
     if (!mapRef.current || !selectedVehicleId) return;
     
     const selectedVehicle = vehicles.find(v => v.device_id === selectedVehicleId);
     if (!selectedVehicle) return;
     
     const mapCenter = mapRef.current.getCenter();
     const vehiclePos = L.latLng(selectedVehicle.latitude, selectedVehicle.longitude);
     const distance = mapCenter.distanceTo(vehiclePos);
     
     // If more than 500m away from vehicle, show recenter button
     setShowRecenterButton(userHasInteracted && distance > 500);
   }, [selectedVehicleId, vehicles, userHasInteracted]);
 
   // Handle recenter button click
   const handleRecenter = useCallback(() => {
     if (!mapRef.current || !selectedVehicleId) return;
     
     const selectedVehicle = vehicles.find(v => v.device_id === selectedVehicleId);
     if (!selectedVehicle) return;
     
     // Reset interaction state
     setUserHasInteracted(false);
     setShowRecenterButton(false);
     
     // Fly to vehicle
     mapRef.current.flyTo(
       [selectedVehicle.latitude, selectedVehicle.longitude],
       16,
       { duration: 0.8 }
     );
   }, [selectedVehicleId, vehicles]);

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

  // Clear drawing state
  const clearDrawingState = useCallback(() => {
    drawingPointsRef.current = [];
    if (drawingLayerRef.current) {
      drawingLayerRef.current.remove();
      drawingLayerRef.current = null;
    }
    drawingMarkersRef.current.forEach(m => m.remove());
    drawingMarkersRef.current = [];
  }, []);

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
 
     // Listen for user interactions (drag, zoom)
     const handleInteractionStart = () => {
       setUserHasInteracted(true);
       
       // Clear any existing timeout
       if (interactionTimeoutRef.current) {
         clearTimeout(interactionTimeoutRef.current);
       }
     };
 
     const handleMoveEnd = () => {
       // Check if we should show recenter button after move ends
       setTimeout(() => {
         if (mapRef.current) {
           // Trigger recenter check
           setShowRecenterButton(prev => prev); // Force re-evaluation
         }
       }, 100);
     };
 
     map.on('dragstart', handleInteractionStart);
     map.on('zoomstart', handleInteractionStart);
     map.on('moveend', handleMoveEnd);

    return () => {
       map.off('dragstart', handleInteractionStart);
       map.off('zoomstart', handleInteractionStart);
       map.off('moveend', handleMoveEnd);
       
       if (interactionTimeoutRef.current) {
         clearTimeout(interactionTimeoutRef.current);
       }
       
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
   }, []);
 
   // Update recenter button visibility when relevant state changes
   useEffect(() => {
     checkIfCenteredOnVehicle();
   }, [checkIfCenteredOnVehicle, userHasInteracted, vehicles]);

  // Handle geofence drawing
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const map = mapRef.current;

    if (isDrawingGeofence) {
      map.getContainer().style.cursor = 'crosshair';
      
      const onClick = (e: L.LeafletMouseEvent) => {
        const point = { lat: e.latlng.lat, lng: e.latlng.lng };
        
        // Check if clicking near first point to close polygon
        if (drawingPointsRef.current.length >= 3) {
          const firstPoint = drawingPointsRef.current[0];
          const distance = map.latLngToLayerPoint(e.latlng)
            .distanceTo(map.latLngToLayerPoint(L.latLng(firstPoint.lat, firstPoint.lng)));
          
          if (distance < 20) {
            // Close polygon
            if (onGeofenceDrawn) {
              onGeofenceDrawn(drawingPointsRef.current);
            }
            clearDrawingState();
            return;
          }
        }

        drawingPointsRef.current.push(point);

        // Add marker for this point
        const marker = L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: 'drawing-marker',
            html: `<div style="width: 12px; height: 12px; background: #00bfff; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #00bfff;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          }),
        }).addTo(map);
        drawingMarkersRef.current.push(marker);

        // Update polygon preview
        if (drawingLayerRef.current) {
          drawingLayerRef.current.remove();
        }

        if (drawingPointsRef.current.length >= 2) {
          drawingLayerRef.current = L.polygon(
            drawingPointsRef.current.map(p => [p.lat, p.lng] as L.LatLngExpression),
            {
              color: '#00bfff',
              weight: 2,
              fillColor: '#00bfff',
              fillOpacity: 0.2,
              dashArray: '5, 10',
            }
          ).addTo(map);
        }
      };

      map.on('click', onClick);

      return () => {
        map.off('click', onClick);
        map.getContainer().style.cursor = '';
        clearDrawingState();
      };
    } else {
      map.getContainer().style.cursor = '';
      clearDrawingState();
    }
  }, [isDrawingGeofence, isMapReady, onGeofenceDrawn, clearDrawingState]);

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

  // Handle selected vehicle change
  useEffect(() => {
    if (!mapRef.current || !selectedVehicleId || !isMapReady) return;
 
     // Check if this is a NEW vehicle selection (user clicked on sidebar)
     const isNewSelection = lastVehicleSelectionRef.current !== selectedVehicleId;
     lastVehicleSelectionRef.current = selectedVehicleId;

    const selectedVehicle = vehicles.find(v => v.device_id === selectedVehicleId);
    if (selectedVehicle) {
       // Only auto-center if:
       // 1. This is a new selection (user clicked on different vehicle)
       // 2. User has NOT interacted with the map
       if (isNewSelection || !userHasInteracted) {
         // Reset interaction state on new selection
         if (isNewSelection) {
           setUserHasInteracted(false);
           setShowRecenterButton(false);
         }
         
         mapRef.current.flyTo(
           [selectedVehicle.latitude, selectedVehicle.longitude],
           16,
           { duration: 1 }
         );
       }

      const marker = markersRef.current.get(selectedVehicleId);
      if (marker) {
        marker.openPopup();
      }
    }
   }, [selectedVehicleId, vehicles, isMapReady, userHasInteracted]);

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
      }

      if (geofence.isActive || selectedGeofenceId === geofence.id) {
        const polygon = L.polygon(
          geofence.coordinates.map(c => [c.lat, c.lng] as L.LatLngExpression),
          {
            color: geofence.color,
            weight: selectedGeofenceId === geofence.id ? 3 : 2,
            fillColor: geofence.color,
            fillOpacity: selectedGeofenceId === geofence.id ? 0.3 : 0.15,
            dashArray: geofence.isActive ? undefined : '5, 10',
          }
        ).addTo(map);

        polygon.bindPopup(`
          <div style="font-family: 'Rajdhani', sans-serif;">
            <h3 style="font-family: 'Orbitron', sans-serif; font-weight: 600; margin: 0 0 8px 0; color: ${geofence.color};">
              ${geofence.name}
            </h3>
            <p style="margin: 0; font-size: 12px; color: hsl(220, 15%, 55%);">
              ${geofence.isActive ? '✅ Ativa' : '⏸️ Inativa'}
            </p>
          </div>
        `);

        existingLayers.set(geofence.id, polygon);

        // Fly to selected geofence
        if (selectedGeofenceId === geofence.id) {
          map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
        }
      }
    });
  }, [geofences, selectedGeofenceId, isMapReady]);

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
 
     {/* Recenter Button - Only shows when following a vehicle but map was moved */}
     {selectedVehicleId && showRecenterButton && (
       <div className="absolute bottom-6 right-4 z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-300">
         <Button
           variant="default"
           size="sm"
           onClick={handleRecenter}
           className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/30"
         >
           <Crosshair className="w-4 h-4" />
           <span className="text-xs font-medium">Re-centralizar</span>
         </Button>
       </div>
     )}
    </div>
  );
}
