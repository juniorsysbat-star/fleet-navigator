 import { Driver } from '@/types/driver';
 
 export const MOCK_DRIVERS: Driver[] = [
   {
     id: 'driver-001',
     name: 'Carlos Silva',
     cnh: '12345678901',
     cnhExpiry: '2025-08-15',
     phone: '(11) 99999-1234',
     photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
     currentVehicleId: 'mock-001',
     createdAt: '2024-01-15T10:00:00Z',
     status: 'active',
   },
   {
     id: 'driver-002',
     name: 'Maria Santos',
     cnh: '98765432109',
     cnhExpiry: '2024-03-20',
     phone: '(11) 98888-5678',
     photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
     currentVehicleId: 'mock-003',
     createdAt: '2024-02-10T14:30:00Z',
     status: 'active',
   },
   {
     id: 'driver-003',
     name: 'João Oliveira',
     cnh: '45678901234',
     cnhExpiry: '2026-11-30',
     phone: '(21) 97777-9012',
     photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
     currentVehicleId: 'mock-002',
     createdAt: '2024-03-05T09:15:00Z',
     status: 'active',
   },
   {
     id: 'driver-004',
     name: 'Ana Costa',
     cnh: '78901234567',
     cnhExpiry: '2025-06-10',
     phone: '(41) 96666-3456',
     photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
     currentVehicleId: 'mock-004',
     createdAt: '2024-04-20T11:45:00Z',
     status: 'active',
   },
   {
     id: 'driver-005',
     name: 'Pedro Lima',
     cnh: '23456789012',
     cnhExpiry: '2024-12-05',
     phone: '(51) 95555-7890',
     photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
     currentVehicleId: 'mock-005',
     createdAt: '2024-05-08T16:20:00Z',
     status: 'active',
   },
 ];
 
 // Função para obter motorista por veículo
 export const getDriverByVehicleId = (vehicleId: string): Driver | undefined => {
   return MOCK_DRIVERS.find(d => d.currentVehicleId === vehicleId);
 };
 
 // Função para obter nome do motorista por ID
 export const getDriverNameById = (driverId: string): string => {
   const driver = MOCK_DRIVERS.find(d => d.id === driverId);
   return driver?.name || 'Não atribuído';
 };