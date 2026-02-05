 export interface Driver {
   id: string;
   name: string;
   cnh: string;
   cnhExpiry: string;
   phone: string;
   photoUrl?: string;
   currentVehicleId?: string;
   createdAt: string;
   status: 'active' | 'inactive';
 }
 
 export interface DriverFormData {
   name: string;
   cnh: string;
   cnhExpiry: string;
   phone: string;
   photoUrl?: string;
   currentVehicleId?: string;
 }