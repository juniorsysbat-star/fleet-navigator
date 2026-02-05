 import L from 'leaflet';
 import { VehicleType } from '@/types/vehicle';
 
 // SVG paths for different vehicle types (Lucide-style icons)
 export const VEHICLE_SVG_PATHS: Record<VehicleType, string> = {
   sedan: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
   motorcycle: `<circle cx="5" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M12 17V5l3 5h-3"/><path d="m8 17 2-5h4l3 5"/>`,
   truck: `<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`,
   pickup: `<path d="M14 17h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H2v6h2"/><path d="M2 11V5a2 2 0 0 1 2-2h6.5a.5.5 0 0 1 .5.5V11"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
   tractor: `<path d="M3 4h8l2 4h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><circle cx="7" cy="16" r="4"/><circle cx="17" cy="14" r="2"/><path d="M3 16h1"/>`,
   bus: `<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>`,
 };
 
 // Status color definitions
 const STATUS_COLORS = {
  moving: { main: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' },   // Green: Moving
  idle: { main: '#ffcc00', glow: 'rgba(255, 204, 0, 0.5)' },     // Yellow: Stopped
  offline: { main: '#666666', glow: 'rgba(102, 102, 102, 0.5)' }, // Gray: Offline
   unknown: { main: '#666666', glow: 'rgba(102, 102, 102, 0.5)' },
  speeding: { main: '#ff0000', glow: 'rgba(255, 0, 0, 0.8)' },   // Red: Alarm/Block
 };
 
 // Create custom marker icon with vehicle type and optional custom color
 export const createVehicleIcon = (
   status: 'moving' | 'idle' | 'offline' | 'unknown' | 'speeding',
   vehicleType: VehicleType = 'sedan',
   customColor?: string
 ): L.DivIcon => {
   // Use custom color if provided and not 'status', otherwise use status color
   const useCustomColor = customColor && customColor !== 'status';
   const statusColors = STATUS_COLORS[status];
   const color = useCustomColor ? customColor : statusColors.main;
   const glowColor = useCustomColor 
     ? `${customColor}80` // Add 50% opacity
     : statusColors.glow;
   
   const isSpeeding = status === 'speeding';
   const svgPath = VEHICLE_SVG_PATHS[vehicleType] || VEHICLE_SVG_PATHS.sedan;
   
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