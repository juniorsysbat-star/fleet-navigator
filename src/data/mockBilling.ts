// Mock data for Financial/Billing module

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleCount: number;
  plan: 'basic' | 'pro' | 'enterprise';
  monthlyValue: number;
  status: 'active' | 'overdue' | 'suspended';
  lastPayment: Date;
  dueDate: Date;
  overdueAmount?: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: Date;
}

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-001',
    name: 'Transportadora Veloz LTDA',
    email: 'financeiro@veloz.com.br',
    phone: '(11) 99999-1234',
    vehicleCount: 25,
    plan: 'enterprise',
    monthlyValue: 2500,
    status: 'active',
    lastPayment: new Date('2025-01-05'),
    dueDate: new Date('2025-02-05'),
  },
  {
    id: 'client-002',
    name: 'LogiExpress Cargas',
    email: 'contato@logiexpress.com',
    phone: '(21) 98888-5678',
    vehicleCount: 12,
    plan: 'pro',
    monthlyValue: 1200,
    status: 'overdue',
    lastPayment: new Date('2024-12-15'),
    dueDate: new Date('2025-01-15'),
    overdueAmount: 1200,
  },
  {
    id: 'client-003',
    name: 'Auto Mecânica Central',
    email: 'gestao@autocentral.com',
    phone: '(31) 97777-9012',
    vehicleCount: 5,
    plan: 'basic',
    monthlyValue: 250,
    status: 'active',
    lastPayment: new Date('2025-01-20'),
    dueDate: new Date('2025-02-20'),
  },
  {
    id: 'client-004',
    name: 'Frota Sul Logística',
    email: 'adm@frotasul.com.br',
    phone: '(51) 96666-3456',
    vehicleCount: 18,
    plan: 'pro',
    monthlyValue: 1800,
    status: 'active',
    lastPayment: new Date('2025-01-10'),
    dueDate: new Date('2025-02-10'),
  },
  {
    id: 'client-005',
    name: 'Rápido Entregas ME',
    email: 'financeiro@rapido.com',
    phone: '(41) 95555-7890',
    vehicleCount: 3,
    plan: 'basic',
    monthlyValue: 150,
    status: 'overdue',
    lastPayment: new Date('2024-11-25'),
    dueDate: new Date('2024-12-25'),
    overdueAmount: 300,
  },
  {
    id: 'client-006',
    name: 'Norte Cargas Express',
    email: 'pagamentos@nortecargas.com',
    phone: '(92) 94444-1234',
    vehicleCount: 8,
    plan: 'pro',
    monthlyValue: 800,
    status: 'active',
    lastPayment: new Date('2025-01-18'),
    dueDate: new Date('2025-02-18'),
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    clientId: 'client-001',
    clientName: 'Transportadora Veloz LTDA',
    amount: 2500,
    dueDate: new Date('2025-02-05'),
    status: 'pending',
  },
  {
    id: 'inv-002',
    clientId: 'client-002',
    clientName: 'LogiExpress Cargas',
    amount: 1200,
    dueDate: new Date('2025-01-15'),
    status: 'overdue',
  },
  {
    id: 'inv-003',
    clientId: 'client-001',
    clientName: 'Transportadora Veloz LTDA',
    amount: 2500,
    dueDate: new Date('2025-01-05'),
    status: 'paid',
    paidDate: new Date('2025-01-05'),
  },
];

export const BILLING_SUMMARY = {
  totalRevenue: 6700,
  totalClients: 6,
  activeClients: 4,
  overdueClients: 2,
  overdueAmount: 1500,
  newClientsThisMonth: 2,
  delinquencyRate: 33.3,
  projectedRevenue: 8200,
  totalVehiclesManaged: 71,
};
