 import { Maintenance } from '@/types/maintenance';
 
 // Função para calcular status baseado no gatilho
 export const calculateMaintenanceStatus = (
   maintenance: Omit<Maintenance, 'status'>
 ): Maintenance['status'] => {
   if (maintenance.completedAt) return 'completed';
   
   if (maintenance.triggerType === 'date' && maintenance.triggerDate) {
     const triggerDate = new Date(maintenance.triggerDate);
     const now = new Date();
     const daysUntil = Math.ceil((triggerDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
     
     if (daysUntil < 0) return 'overdue';
     if (daysUntil <= 7) return 'due';
     return 'pending';
   }
   
   if (maintenance.triggerType === 'odometer' && maintenance.triggerKm && maintenance.currentKm) {
     const kmUntil = maintenance.triggerKm - maintenance.currentKm;
     const percentUsed = (maintenance.currentKm / maintenance.triggerKm) * 100;
     
     if (kmUntil <= 0) return 'overdue';
     if (percentUsed >= 90) return 'due';
     return 'pending';
   }
   
   return 'pending';
 };
 
 export const MOCK_MAINTENANCES: Maintenance[] = [
   {
     id: 'maint-001',
     vehicleId: 'mock-001',
     vehicleName: 'Caminhão 01',
     type: 'Troca de Óleo',
     triggerType: 'odometer',
     triggerKm: 150000,
     currentKm: 148500,
     status: 'due',
     notes: 'Usar óleo sintético 15W40',
     createdAt: '2024-11-15T10:00:00Z',
   },
   {
     id: 'maint-002',
     vehicleId: 'mock-003',
     vehicleName: 'Van 03',
     type: 'Revisão de Freios',
     triggerType: 'date',
     triggerDate: '2025-02-20',
     currentKm: 87200,
     status: 'pending',
     createdAt: '2024-10-20T14:30:00Z',
   },
   {
     id: 'maint-003',
     vehicleId: 'mock-002',
     vehicleName: 'Carro 02',
     type: 'Troca de Pneus',
     triggerType: 'odometer',
     triggerKm: 55000,
     currentKm: 45800,
     status: 'pending',
     createdAt: '2024-12-01T09:15:00Z',
   },
   {
     id: 'maint-004',
     vehicleId: 'mock-004',
     vehicleName: 'Moto 04',
     type: 'Troca de Óleo',
     triggerType: 'odometer',
     triggerKm: 30000,
     currentKm: 29800,
     status: 'overdue',
     createdAt: '2024-09-10T11:45:00Z',
   },
   {
     id: 'maint-005',
     vehicleId: 'mock-005',
     vehicleName: 'Caminhonete 05',
     type: 'Revisão Geral',
     triggerType: 'date',
     triggerDate: '2025-01-15',
     currentKm: 21500,
     status: 'due',
     createdAt: '2024-08-05T16:20:00Z',
   },
   {
     id: 'maint-006',
     vehicleId: 'mock-001',
     vehicleName: 'Caminhão 01',
     type: 'Alinhamento e Balanceamento',
     triggerType: 'date',
     triggerDate: '2025-03-10',
     currentKm: 148500,
     status: 'pending',
     createdAt: '2024-12-10T08:00:00Z',
   },
 ];
 
 // Obter manutenções por veículo
 export const getMaintenancesByVehicle = (vehicleId: string): Maintenance[] => {
   return MOCK_MAINTENANCES.filter(m => m.vehicleId === vehicleId);
 };
 
 // Obter manutenções pendentes/vencidas
 export const getPendingMaintenances = (): Maintenance[] => {
   return MOCK_MAINTENANCES.filter(m => m.status !== 'completed');
 };