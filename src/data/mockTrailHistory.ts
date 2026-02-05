 import { format } from 'date-fns';
 
 export interface TrailPoint {
   lat: number;
   lng: number;
   timestamp: string;
   speed: number;
   isStop: boolean;
   stopDuration?: number; // minutes
 }
 
 // Simula pontos que "seguem" as ruas (com curvas realistas)
 // Gera um trajeto que parece grudado nas ruas, não em linha reta
 export function generateRealisticTrail(
   centerLat: number,
   centerLng: number,
   date: Date
 ): TrailPoint[] {
   const trail: TrailPoint[] = [];
   
   // Define waypoints simulando um trajeto urbano real
   // Os pontos seguem padrões de ruas (ângulos retos, curvas suaves)
   const baseTime = new Date(date);
   baseTime.setHours(7, 30, 0, 0); // Início às 7:30
 
   // Gera segmentos de rua simulando quarteirões
   const segments = generateStreetSegments(centerLat, centerLng);
   
   let currentTime = baseTime.getTime();
   let pointIndex = 0;
 
   for (let segIdx = 0; segIdx < segments.length; segIdx++) {
     const segment = segments[segIdx];
     const isStopSegment = segment.isStop;
     
     if (isStopSegment) {
       // Add stop point
       const stopDuration = 5 + Math.floor(Math.random() * 25); // 5-30 min
       trail.push({
         lat: segment.points[0].lat,
         lng: segment.points[0].lng,
         timestamp: new Date(currentTime).toISOString(),
         speed: 0,
         isStop: true,
         stopDuration,
       });
       currentTime += stopDuration * 60 * 1000;
     } else {
       // Add movement points
       for (const point of segment.points) {
         const speed = 20 + Math.random() * 40; // 20-60 km/h
         trail.push({
           lat: point.lat,
           lng: point.lng,
           timestamp: new Date(currentTime).toISOString(),
           speed: Math.round(speed),
           isStop: false,
         });
         // Time increment based on "distance" (simulate ~30-50 km/h average)
         currentTime += (15 + Math.random() * 15) * 1000; // 15-30 seconds per point
         pointIndex++;
       }
     }
   }
 
   return trail;
 }
 
 interface StreetSegment {
   points: { lat: number; lng: number }[];
   isStop: boolean;
 }
 
 // Gera segmentos que simulam ruas com curvas e esquinas
 function generateStreetSegments(centerLat: number, centerLng: number): StreetSegment[] {
   const segments: StreetSegment[] = [];
   let currentLat = centerLat;
   let currentLng = centerLng;
   
   // Define direções baseadas em padrão de grade urbana
   const directions = [
     { lat: 0, lng: 1 },      // Leste
     { lat: -1, lng: 0 },     // Norte
     { lat: 0, lng: -1 },     // Oeste
     { lat: 1, lng: 0 },      // Sul
   ];
   
   let dirIndex = 0;
   const numBlocks = 12 + Math.floor(Math.random() * 8); // 12-20 blocos
   const stopFrequency = 4; // Parada a cada ~4 blocos
 
   for (let block = 0; block < numBlocks; block++) {
     // Check if this is a stop
     if (block > 0 && block % stopFrequency === 0) {
       segments.push({
         points: [{ lat: currentLat, lng: currentLng }],
         isStop: true,
       });
     }
 
     // Generate street segment (simula um quarteirão)
     const blockLength = 8 + Math.floor(Math.random() * 6); // 8-14 pontos por bloco
     const points: { lat: number; lng: number }[] = [];
     
     const dir = directions[dirIndex % 4];
     const stepSize = 0.0003 + Math.random() * 0.0002; // ~30-50m por ponto
     
     for (let i = 0; i < blockLength; i++) {
       // Add small random variation to simulate road curvature
       const variation = (Math.random() - 0.5) * 0.00005;
       
       currentLat += dir.lat * stepSize + (dir.lng !== 0 ? variation : 0);
       currentLng += dir.lng * stepSize + (dir.lat !== 0 ? variation : 0);
       
       points.push({ lat: currentLat, lng: currentLng });
     }
     
     segments.push({ points, isStop: false });
     
     // Chance to turn at intersection
     if (Math.random() > 0.4) {
       dirIndex += Math.random() > 0.5 ? 1 : 3; // Turn left or right
     }
   }
 
   return segments;
 }
 
 // Dados de exemplo para trajetos específicos (cache)
 export const SAMPLE_TRAILS: Record<string, TrailPoint[]> = {};