 import L from 'leaflet';
 import { VehicleType } from '@/types/vehicle';
 
 // SVG paths for different vehicle types (Lucide-style icons)
 // Mapeamento atualizado para corresponder ao utils/vehicleIcons.tsx
 export const VEHICLE_SVG_PATHS: Record<string, string> = {
   // Carros (CarFront icon path)
   sedan: `<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>`,
   car: `<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>`,
   pickup: `<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>`,
   
   // Caminhões (Truck icon path)
   truck: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H12"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`,
   bus: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H12"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`,
   tractor: `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H12"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>`,
   
   // Motos (Bike icon path)
   motorcycle: `<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>`,
 };
 
 // Status color definitions
 const STATUS_COLORS = {
  moving: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },   // Emerald: Moving
  idle: { main: '#eab308', glow: 'rgba(234, 179, 8, 0.5)' },      // Yellow: Stopped
  offline: { main: '#9ca3af', glow: 'rgba(156, 163, 175, 0.3)' }, // Gray-400: Offline
  unknown: { main: '#9ca3af', glow: 'rgba(156, 163, 175, 0.3)' }, // Gray-400: Unknown
  speeding: { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' },  // Red: Alarm/Block
 };
 
 // Create custom marker icon with vehicle type and optional custom color
 export const createVehicleIcon = (
   status: 'moving' | 'idle' | 'offline' | 'unknown' | 'speeding',
   vehicleType: VehicleType | string = 'sedan',
   customColor?: string
 ): L.DivIcon => {
   const statusColors = STATUS_COLORS[status];
  // Always use status color - ignore custom color for consistency
  const color = statusColors.main;
  const glowColor = statusColors.glow;
   
   const isSpeeding = status === 'speeding';
   const normalizedType = (vehicleType || 'sedan').toLowerCase();
   const svgPath = VEHICLE_SVG_PATHS[normalizedType] || VEHICLE_SVG_PATHS.sedan;
   
   return L.divIcon({
     className: 'custom-vehicle-marker',
     html: `
       <div style="
         position: relative;
         width: 44px;
         height: 44px;
         display: flex;
         align-items: center;
         justify-content: center;
       ">
         <div style="
           position: absolute;
           width: 44px;
           height: 44px;
           background: ${glowColor};
           border-radius: 50%;
           animation: ${isSpeeding ? 'pulse-fast' : 'pulse'} ${isSpeeding ? '0.5s' : '2s'} infinite;
         "></div>
         <div style="
           position: relative;
           width: 36px;
           height: 36px;
           background: linear-gradient(135deg, ${isSpeeding ? 'hsl(0 60% 12%)' : 'hsl(220 25% 12%)'} 0%, ${isSpeeding ? 'hsl(0 70% 8%)' : 'hsl(220 30% 8%)'} 100%);
           border: 2px solid ${color};
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 0 0 ${isSpeeding ? '25px' : '18px'} ${glowColor};
         ">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
             ${svgPath}
           </svg>
         </div>
         ${isSpeeding ? `
           <div style="
             position: absolute;
             top: -6px;
             right: -6px;
             width: 18px;
             height: 18px;
             background: #ff0000;
             border: 2px solid white;
             border-radius: 50%;
             display: flex;
             align-items: center;
             justify-content: center;
             font-size: 10px;
             font-weight: bold;
             color: white;
             animation: pulse-fast 0.5s infinite;
           ">!</div>
         ` : ''}
       </div>
       <style>
         @keyframes pulse {
           0%, 100% { transform: scale(1); opacity: 0.5; }
           50% { transform: scale(1.5); opacity: 0; }
         }
         @keyframes pulse-fast {
           0%, 100% { transform: scale(1); opacity: 1; }
           50% { transform: scale(1.2); opacity: 0.6; }
         }
       </style>
     `,
     iconSize: [44, 44],
     iconAnchor: [22, 22],
     popupAnchor: [0, -22],
   });
 };
 
 // Legacy wrapper for backwards compatibility
 export const createCustomIcon = (status: 'moving' | 'idle' | 'offline' | 'unknown' | 'speeding') => {
   return createVehicleIcon(status, 'sedan');
 };