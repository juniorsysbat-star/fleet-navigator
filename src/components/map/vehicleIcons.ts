 import L from 'leaflet';
 import { VehicleType } from '@/types/vehicle';
 
// Status LED color definitions (clean, no pulse)
export type MarkerStatus = 'moving' | 'stopped' | 'alert' | 'offline';

const STATUS_LED_COLORS: Record<MarkerStatus, { fill: string; border: string }> = {
  moving: { fill: 'hsl(142, 76%, 36%)', border: 'hsl(142, 76%, 46%)' },   // 🟢 Green
  stopped: { fill: 'hsl(45, 93%, 47%)', border: 'hsl(45, 93%, 57%)' },    // 🟡 Yellow
  alert: { fill: 'hsl(0, 72%, 51%)', border: 'hsl(0, 72%, 61%)' },        // 🔴 Red
  offline: { fill: 'hsl(0, 0%, 45%)', border: 'hsl(0, 0%, 55%)' },        // ⚪ Gray
};

// SVG paths for different vehicle types
export const VEHICLE_SVG_PATHS: Record<VehicleType, string> = {
   sedan: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
   motorcycle: `<circle cx="5" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M12 17V5l3 5h-3"/><path d="m8 17 2-5h4l3 5"/>`,
   truck: `<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`,
   pickup: `<path d="M14 17h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H2v6h2"/><path d="M2 11V5a2 2 0 0 1 2-2h6.5a.5.5 0 0 1 .5.5V11"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
   tractor: `<path d="M3 4h8l2 4h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><circle cx="7" cy="16" r="4"/><circle cx="17" cy="14" r="2"/><path d="M3 16h1"/>`,
   bus: `<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>`,
 };
 
/**
 * Determine marker status based on vehicle data
 * 🔴 RED (alert): blocked OR has alarm
 * 🟡 YELLOW (stopped): online AND speed < 2
 * 🟢 GREEN (moving): online AND speed > 2
 * ⚪ GRAY (offline): offline or no communication
 */
export const getMarkerStatus = (
  isOnline: boolean,
  speed: number,
  isBlocked?: boolean,
  hasAlarm?: boolean
): MarkerStatus => {
  // Alert takes priority (blocked or alarm)
  if (isBlocked || hasAlarm) {
    return 'alert';
  }
  
  // Offline
  if (!isOnline) {
    return 'offline';
  }
  
  // Online: check speed
  if (speed > 2) {
    return 'moving';
  }
  
  return 'stopped';
};
 
// Create clean, static marker icon with status LED colors
 export const createVehicleIcon = (
  status: MarkerStatus,
   vehicleType: VehicleType = 'sedan',
   customColor?: string
 ): L.DivIcon => {
   const useCustomColor = customColor && customColor !== 'status';
  const ledColors = STATUS_LED_COLORS[status];
  const fillColor = useCustomColor ? customColor : ledColors.fill;
  const borderColor = useCustomColor ? customColor : ledColors.border;
   
   const svgPath = VEHICLE_SVG_PATHS[vehicleType] || VEHICLE_SVG_PATHS.sedan;
   
   return L.divIcon({
     className: 'custom-vehicle-marker',
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
           position: relative;
          width: 40px;
          height: 40px;
          background: ${fillColor};
          border: 3px solid ${borderColor};
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
         ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             ${svgPath}
           </svg>
         </div>
        ${status === 'alert' ? `
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 14px;
          height: 14px;
          background: white;
          border: 2px solid hsl(0, 72%, 51%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: bold;
          color: hsl(0, 72%, 51%);
        ">!</div>
        ` : ''}
       </div>
     `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
   });
 };
 
 // Legacy wrapper for backwards compatibility
 export const createCustomIcon = (status: 'moving' | 'idle' | 'offline' | 'unknown' | 'speeding') => {
  // Map old status to new MarkerStatus
  const statusMap: Record<string, MarkerStatus> = {
    moving: 'moving',
    idle: 'stopped',
    offline: 'offline',
    unknown: 'offline',
    speeding: 'moving',
  };
  return createVehicleIcon(statusMap[status] || 'offline', 'sedan');
 };