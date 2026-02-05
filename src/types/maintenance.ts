 export type MaintenanceTriggerType = 'date' | 'odometer';
 export type MaintenanceStatus = 'pending' | 'due' | 'overdue' | 'completed';
 
 export interface Maintenance {
   id: string;
   vehicleId: string;
   vehicleName: string;
   type: string;
   triggerType: MaintenanceTriggerType;
   triggerDate?: string;
   triggerKm?: number;
   currentKm?: number;
   status: MaintenanceStatus;
   notes?: string;
   createdAt: string;
   completedAt?: string;
 }
 
 export interface MaintenanceFormData {
   vehicleId: string;
   type: string;
   triggerType: MaintenanceTriggerType;
   triggerDate?: string;
   triggerKm?: number;
   notes?: string;
 }