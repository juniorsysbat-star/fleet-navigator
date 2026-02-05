 import { useRef, useCallback, useEffect } from 'react';
 import L from 'leaflet';
 
 export type DrawingMode = 'polygon' | 'circle' | null;
 
 export interface GeofenceDrawResult {
   type: 'polygon' | 'circle';
   coordinates?: { lat: number; lng: number }[];
   center?: { lat: number; lng: number };
   radius?: number;
 }
 
 interface UseGeofenceDrawingProps {
   map: L.Map | null;
   isMapReady: boolean;
   isDrawing: boolean;
   drawingMode: DrawingMode;
   onGeofenceDrawn?: (result: GeofenceDrawResult) => void;
 }
 
 export function useGeofenceDrawing({
   map,
   isMapReady,
   isDrawing,
   drawingMode,
   onGeofenceDrawn,
 }: UseGeofenceDrawingProps) {
   const drawingPointsRef = useRef<{ lat: number; lng: number }[]>([]);
   const drawingLayerRef = useRef<L.Polygon | null>(null);
   const drawingMarkersRef = useRef<L.Marker[]>([]);
   const circleDrawingRef = useRef<{ center: L.LatLng | null; circle: L.Circle | null }>({ 
     center: null, 
     circle: null 
   });
 
   // Clear all drawing state
   const clearDrawingState = useCallback(() => {
     drawingPointsRef.current = [];
     
     if (drawingLayerRef.current) {
       drawingLayerRef.current.remove();
       drawingLayerRef.current = null;
     }
     
     drawingMarkersRef.current.forEach(m => m.remove());
     drawingMarkersRef.current = [];
     
     if (circleDrawingRef.current.circle) {
       circleDrawingRef.current.circle.remove();
       circleDrawingRef.current.circle = null;
     }
     circleDrawingRef.current.center = null;
   }, []);
 
   useEffect(() => {
     if (!map || !isMapReady) return;
 
     if (!isDrawing) {
       map.getContainer().style.cursor = '';
       clearDrawingState();
       return;
     }
 
     map.getContainer().style.cursor = 'crosshair';
 
     if (drawingMode === 'circle') {
       // Circle drawing mode
       let isDragging = false;
 
       const onMouseDown = (e: L.LeafletMouseEvent) => {
         isDragging = true;
         circleDrawingRef.current.center = e.latlng;
 
         // Remove old circle preview
         if (circleDrawingRef.current.circle) {
           circleDrawingRef.current.circle.remove();
         }
 
         // Create new circle preview
         circleDrawingRef.current.circle = L.circle(e.latlng, {
           radius: 10,
           color: '#00bfff',
           weight: 2,
           fillColor: '#00bfff',
           fillOpacity: 0.2,
           dashArray: '5, 10',
         }).addTo(map);
 
         // Add center marker
         const centerMarker = L.marker(e.latlng, {
           icon: L.divIcon({
             className: 'drawing-marker',
             html: `<div style="width: 14px; height: 14px; background: #00bfff; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #00bfff;"></div>`,
             iconSize: [14, 14],
             iconAnchor: [7, 7],
           }),
         }).addTo(map);
         drawingMarkersRef.current.push(centerMarker);
       };
 
       const onMouseMove = (e: L.LeafletMouseEvent) => {
         if (!isDragging || !circleDrawingRef.current.center || !circleDrawingRef.current.circle) return;
         const radius = circleDrawingRef.current.center.distanceTo(e.latlng);
         circleDrawingRef.current.circle.setRadius(radius);
       };
 
       const onMouseUp = (e: L.LeafletMouseEvent) => {
         if (!isDragging || !circleDrawingRef.current.center) return;
         isDragging = false;
 
         const radius = circleDrawingRef.current.center.distanceTo(e.latlng);
 
         if (radius > 20 && onGeofenceDrawn) {
           onGeofenceDrawn({
             type: 'circle',
             center: {
               lat: circleDrawingRef.current.center.lat,
               lng: circleDrawingRef.current.center.lng,
             },
             radius,
           });
         }
         clearDrawingState();
       };
 
       map.on('mousedown', onMouseDown);
       map.on('mousemove', onMouseMove);
       map.on('mouseup', onMouseUp);
 
       return () => {
         map.off('mousedown', onMouseDown);
         map.off('mousemove', onMouseMove);
         map.off('mouseup', onMouseUp);
         map.getContainer().style.cursor = '';
         clearDrawingState();
       };
     } else {
       // Polygon drawing mode
       const onClick = (e: L.LeafletMouseEvent) => {
         const point = { lat: e.latlng.lat, lng: e.latlng.lng };
 
         // Check if clicking near first point to close polygon
         if (drawingPointsRef.current.length >= 3) {
           const firstPoint = drawingPointsRef.current[0];
           const distance = map.latLngToLayerPoint(e.latlng)
             .distanceTo(map.latLngToLayerPoint(L.latLng(firstPoint.lat, firstPoint.lng)));
 
           if (distance < 20) {
             if (onGeofenceDrawn) {
               onGeofenceDrawn({
                 type: 'polygon',
                 coordinates: drawingPointsRef.current,
               });
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
     }
   }, [map, isMapReady, isDrawing, drawingMode, onGeofenceDrawn, clearDrawingState]);
 
   return { clearDrawingState };
 }