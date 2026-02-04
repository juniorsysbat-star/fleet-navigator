import { User, UserDeviceAssociation } from '@/types/user';

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Carlos Administrador',
    email: 'carlos.admin@fleetai.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2026-02-04T10:30:00'),
  },
  {
    id: 'user-002',
    name: 'Maria Gerente',
    email: 'maria.gerente@transportes.com.br',
    role: 'manager',
    status: 'active',
    createdAt: new Date('2024-03-20'),
    lastLogin: new Date('2026-02-03T16:45:00'),
  },
  {
    id: 'user-003',
    name: 'João Operador',
    email: 'joao.operador@logistica.com',
    role: 'user',
    status: 'active',
    createdAt: new Date('2024-06-10'),
    lastLogin: new Date('2026-02-04T08:15:00'),
  },
  {
    id: 'user-004',
    name: 'Ana Supervisora',
    email: 'ana.super@frota.com.br',
    role: 'manager',
    status: 'active',
    createdAt: new Date('2024-08-05'),
    lastLogin: new Date('2026-02-02T14:20:00'),
  },
  {
    id: 'user-005',
    name: 'Pedro Motorista',
    email: 'pedro.driver@empresa.com',
    role: 'user',
    status: 'inactive',
    createdAt: new Date('2024-09-12'),
    lastLogin: new Date('2026-01-15T09:00:00'),
  },
  {
    id: 'user-006',
    name: 'Lucia Financeiro',
    email: 'lucia.fin@holding.com',
    role: 'manager',
    status: 'active',
    createdAt: new Date('2024-11-01'),
    lastLogin: new Date('2026-02-04T11:00:00'),
  },
  {
    id: 'user-007',
    name: 'Roberto Cliente',
    email: 'roberto@cliente.com',
    role: 'user',
    status: 'pending',
    createdAt: new Date('2026-02-01'),
  },
];

// tc_user_device equivalent - links users to vehicles they can see
export const MOCK_USER_DEVICE_ASSOCIATIONS: UserDeviceAssociation[] = [
  // Admin can see all (not listed, handled by role)
  // Maria (manager) can see vehicles 1 and 2
  { userId: 'user-002', deviceId: 'VH001' },
  { userId: 'user-002', deviceId: 'VH002' },
  // João (user) can only see vehicle 1
  { userId: 'user-003', deviceId: 'VH001' },
  // Ana (manager) can see all vehicles
  { userId: 'user-004', deviceId: 'VH001' },
  { userId: 'user-004', deviceId: 'VH002' },
  { userId: 'user-004', deviceId: 'VH003' },
  // Pedro (inactive user) - had access to vehicle 2
  { userId: 'user-005', deviceId: 'VH002' },
  // Lucia can see vehicle 3
  { userId: 'user-006', deviceId: 'VH003' },
];

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    user: 'Usuário',
  };
  return labels[role] || role;
};

export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    admin: 'bg-destructive/20 text-destructive border-destructive/30',
    manager: 'bg-warning/20 text-warning border-warning/30',
    user: 'bg-accent/20 text-accent border-accent/30',
  };
  return colors[role] || 'bg-muted text-muted-foreground';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-success/20 text-success border-success/30',
    inactive: 'bg-muted text-muted-foreground border-muted',
    pending: 'bg-warning/20 text-warning border-warning/30',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};
