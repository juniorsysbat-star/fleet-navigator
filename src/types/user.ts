export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
}

export interface UserDeviceAssociation {
  userId: string;
  deviceId: string;
}

export interface UserWithVehicles extends User {
  assignedVehicleIds: string[];
}
