 export type UserRole = 'super_admin' | 'embarcador' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
  expirationDate?: Date;
   embarcadorId?: string; // ID do embarcador pai (para clientes de embarcadores)
}
 
 // Configurações White Label do Embarcador
 export interface EmbarcadorSettings {
   logoUrl?: string;
   primaryColor: string; // HSL format
   companyName: string;
   moduleNames?: {
     tracking?: string;
     analytics?: string;
     billing?: string;
     users?: string;
     settings?: string;
   };
 }
 
 // Dados do Embarcador (Revendedor)
 export interface Embarcador {
   id: string;
   name: string;
   email: string;
   phone: string;
   cnpj: string;
   status: 'active' | 'inactive' | 'pending';
   createdAt: Date;
   settings: EmbarcadorSettings;
   pricePerVehicle: number; // Preço por placa (R$/mês)
   vehicleCount: number;
   clientCount: number;
 }
 
 // Registro de veículo para cálculo pró-rata
 export interface VehicleRegistration {
   vehicleId: string;
   embarcadorId: string;
   addedAt: Date;
   removedAt?: Date;
   isActive: boolean;
 }
 
 // Fatura calculada do embarcador
 export interface EmbarcadorInvoice {
   embarcadorId: string;
   month: string; // YYYY-MM
   fullVehicles: number;
   proRataVehicles: { count: number; percentage: number }[];
   pricePerVehicle: number;
   totalAmount: number;
 }

export interface UserDeviceAssociation {
  userId: string;
  deviceId: string;
}

export interface UserWithVehicles extends User {
  assignedVehicleIds: string[];
}
