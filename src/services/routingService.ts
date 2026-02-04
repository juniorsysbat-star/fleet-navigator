import { RouteInfo } from '@/types/mission';

// OSRM Demo Server - Free public routing API
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

export async function calculateRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteInfo | null> {
  try {
    const url = `${OSRM_BASE_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    
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
    
    return {
      distance: route.distance,
      duration: route.duration,
      coordinates,
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
