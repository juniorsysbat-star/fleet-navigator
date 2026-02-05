 import { Car, CarFront, Truck, Bike } from 'lucide-react';
 import { VehicleType } from '@/types/vehicle';
 import { cn } from '@/lib/utils';
 
 // Mapeia tipos de veículos para ícones Lucide
 const VEHICLE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
   // Caminhões / Carretas
   truck: Truck,
   caminhão: Truck,
   caminhao: Truck,
   carreta: Truck,
   
   // Carros / Utilitários
   sedan: CarFront,
   car: CarFront,
   carro: CarFront,
   utilitário: CarFront,
   utilitario: CarFront,
   camionete: CarFront,
   pickup: CarFront,
   
   // Motos
   motorcycle: Bike,
   moto: Bike,
   motocicleta: Bike,
   
   // Ônibus
   bus: Truck,
   onibus: Truck,
   ônibus: Truck,
   
   // Tratores
   tractor: Truck,
   trator: Truck,
 };
 
 interface GetVehicleIconProps {
   type?: VehicleType | string;
   className?: string;
 }
 
 /**
  * Retorna o ícone Lucide correto baseado no tipo do veículo.
  * Normaliza para minúsculas e retorna Car como fallback.
  */
 export function getVehicleIcon({ type, className = "w-4 h-4" }: GetVehicleIconProps): React.ReactNode {
   const normalizedType = (type || '').toLowerCase().trim();
   const IconComponent = VEHICLE_ICON_MAP[normalizedType] || Car;
   
   return <IconComponent className={cn(className)} />;
 }
 
 /**
  * Retorna o componente de ícone (não renderizado) para uso com customização.
  */
 export function getVehicleIconComponent(type?: VehicleType | string): React.ComponentType<{ className?: string }> {
   const normalizedType = (type || '').toLowerCase().trim();
   return VEHICLE_ICON_MAP[normalizedType] || Car;
 }