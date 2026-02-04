import { RouteInfo, RouteSegmentSpeed } from '@/types/mission';

// OSRM Demo Server - Free public routing API with annotations for speed
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

// Simulate speed limits based on road type detection (since public OSRM doesn't expose maxspeed)
// In production, you'd use OSRM with custom profile or Overpass API for OSM maxspeed tags
function estimateSpeedLimitsFromCoordinates(
  coordinates: { lat: number; lng: number }[],
  legs: any[]
): RouteSegmentSpeed[] {
  const speedLimits: RouteSegmentSpeed[] = [];
  
  // If we have leg/step data from OSRM, try to extract speed info
  if (legs && legs.length > 0) {
    let coordIndex = 0;
    
    for (const leg of legs) {
      if (leg.steps) {
        for (const step of leg.steps) {
          // OSRM provides speed in m/s, convert to km/h
          // Also uses road classification to estimate limits
          let maxSpeed = 60; // Default urban speed
          
          // Try to get speed from step data
          if (step.speed) {
            maxSpeed = Math.round(step.speed * 3.6); // m/s to km/h
          }
          
          // Adjust based on road type if available
          if (step.name) {
            const roadName = step.name.toLowerCase();
            if (roadName.includes('rodovia') || roadName.includes('highway') || roadName.includes('br-') || roadName.includes('sp-')) {
              maxSpeed = Math.max(maxSpeed, 100);
            } else if (roadName.includes('avenida') || roadName.includes('avenue')) {
              maxSpeed = Math.max(maxSpeed, 60);
            } else if (roadName.includes('rua') || roadName.includes('street')) {
              maxSpeed = Math.max(maxSpeed, 40);
            }
          }
          
          // Adjust based on road class
          if (step.driving_side === 'right' && step.mode === 'driving') {
            // Use ref if available (usually contains road number)
            if (step.ref && (step.ref.startsWith('BR') || step.ref.startsWith('SP'))) {
              maxSpeed = 110;
            }
          }
          
          const stepCoordCount = step.geometry?.coordinates?.length || 10;
          
          speedLimits.push({
            startIndex: coordIndex,
            endIndex: coordIndex + stepCoordCount,
            maxSpeed: Math.min(maxSpeed, 120), // Cap at 120 km/h
            roadName: step.name || undefined,
          });
          
          coordIndex += stepCoordCount;
        }
      }
    }
  }
  
  // If no speed limits were extracted, create segments with simulated data
  if (speedLimits.length === 0) {
    const segmentSize = Math.ceil(coordinates.length / 10);
    for (let i = 0; i < coordinates.length; i += segmentSize) {
      // Simulate varying speed limits along route
      const urbanProbability = Math.random();
      let maxSpeed: number;
      
      if (urbanProbability < 0.3) {
        maxSpeed = 40; // Urban streets
      } else if (urbanProbability < 0.6) {
        maxSpeed = 60; // Avenues
      } else if (urbanProbability < 0.85) {
        maxSpeed = 80; // State roads
      } else {
        maxSpeed = 110; // Highways
      }
      
      speedLimits.push({
        startIndex: i,
        endIndex: Math.min(i + segmentSize, coordinates.length - 1),
        maxSpeed,
      });
    }
  }
  
  return speedLimits;
}

export async function calculateRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteInfo | null> {
  try {
    // Request with steps and annotations for more detailed speed info
    const url = `${OSRM_BASE_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true&annotations=speed,duration`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM routing failed:', data);
      return null;
    }
    
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
      lat: coord[1],
      lng: coord[0],
    }));
    
    // Extract speed limits from route data
    const speedLimits = estimateSpeedLimitsFromCoordinates(coordinates, route.legs);
    
    return {
      distance: route.distance,
      duration: route.duration,
      coordinates,
      speedLimits,
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
}

// Calculate distance from a point to the nearest point on the route
export function getDistanceToRoute(
  point: { lat: number; lng: number },
  routeCoordinates: { lat: number; lng: number }[]
): number {
  if (routeCoordinates.length === 0) return Infinity;
  
  let minDistance = Infinity;
  
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const distance = pointToLineDistance(
      point,
      routeCoordinates[i],
      routeCoordinates[i + 1]
    );
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance;
}

// Get the current road speed limit based on vehicle position
export function getCurrentRoadSpeedLimit(
  vehiclePosition: { lat: number; lng: number },
  routeCoordinates: { lat: number; lng: number }[],
  speedLimits: RouteSegmentSpeed[]
): { maxSpeed: number; roadName?: string; segmentIndex: number } {
  if (routeCoordinates.length === 0 || speedLimits.length === 0) {
    return { maxSpeed: 60, segmentIndex: -1 }; // Default
  }
  
  // Find closest point index on route
  let closestIndex = 0;
  let minDistance = Infinity;
  
  for (let i = 0; i < routeCoordinates.length; i++) {
    const distance = haversineDistance(vehiclePosition, routeCoordinates[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  // Find which speed segment this index belongs to
  for (let i = 0; i < speedLimits.length; i++) {
    const segment = speedLimits[i];
    if (closestIndex >= segment.startIndex && closestIndex <= segment.endIndex) {
      return {
        maxSpeed: segment.maxSpeed,
        roadName: segment.roadName,
        segmentIndex: i,
      };
    }
  }
  
  // Default to last segment or fallback
  const lastSegment = speedLimits[speedLimits.length - 1];
  return {
    maxSpeed: lastSegment?.maxSpeed || 60,
    roadName: lastSegment?.roadName,
    segmentIndex: speedLimits.length - 1,
  };
}

// Haversine distance between two points in meters
export function haversineDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate perpendicular distance from point to line segment
function pointToLineDistance(
  point: { lat: number; lng: number },
  lineStart: { lat: number; lng: number },
  lineEnd: { lat: number; lng: number }
): number {
  const A = point.lat - lineStart.lat;
  const B = point.lng - lineStart.lng;
  const C = lineEnd.lat - lineStart.lat;
  const D = lineEnd.lng - lineStart.lng;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let closestLat, closestLng;

  if (param < 0) {
    closestLat = lineStart.lat;
    closestLng = lineStart.lng;
  } else if (param > 1) {
    closestLat = lineEnd.lat;
    closestLng = lineEnd.lng;
  } else {
    closestLat = lineStart.lat + param * C;
    closestLng = lineStart.lng + param * D;
  }

  return haversineDistance(point, { lat: closestLat, lng: closestLng });
}

// Calculate remaining distance along route from current position
export function getRemainingDistance(
  currentPosition: { lat: number; lng: number },
  routeCoordinates: { lat: number; lng: number }[]
): number {
  if (routeCoordinates.length < 2) return 0;
  
  // Find the closest point on the route
  let closestIndex = 0;
  let minDistance = Infinity;
  
  for (let i = 0; i < routeCoordinates.length; i++) {
    const distance = haversineDistance(currentPosition, routeCoordinates[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  // Sum distances from closest point to destination
  let remainingDistance = 0;
  for (let i = closestIndex; i < routeCoordinates.length - 1; i++) {
    remainingDistance += haversineDistance(routeCoordinates[i], routeCoordinates[i + 1]);
  }
  
  return remainingDistance;
}

// Geocoding using Nominatim (OpenStreetMap)
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FleetAI-Pro/1.0',
      },
    });
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
