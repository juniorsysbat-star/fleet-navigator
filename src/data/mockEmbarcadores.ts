 import { Embarcador, VehicleRegistration, EmbarcadorInvoice } from '@/types/user';
 
 // Dados mockados de Embarcadores (Revendedores)
 export const MOCK_EMBARCADORES: Embarcador[] = [
   {
     id: 'emb-001',
     name: 'TransLog Tecnologia',
     email: 'contato@translog.com.br',
     phone: '(11) 99999-1234',
     cnpj: '12.345.678/0001-90',
     status: 'active',
     createdAt: new Date('2024-01-15'),
     settings: {
       logoUrl: '',
       primaryColor: '142 76% 36%', // Verde
       companyName: 'TransLog',
       moduleNames: {
         tracking: 'Monitoramento',
         analytics: 'Relatórios',
       },
     },
     pricePerVehicle: 29.90,
     vehicleCount: 100,
     clientCount: 12,
   },
   {
     id: 'emb-002',
     name: 'RastreioMax Soluções',
     email: 'financeiro@rastreiomax.com.br',
     phone: '(21) 98888-5678',
     cnpj: '98.765.432/0001-10',
     status: 'active',
     createdAt: new Date('2024-03-20'),
     settings: {
       logoUrl: '',
       primaryColor: '217 91% 60%', // Azul
       companyName: 'RastreioMax',
       moduleNames: {
         tracking: 'Rastreamento',
         analytics: 'Análise',
       },
     },
     pricePerVehicle: 34.90,
     vehicleCount: 75,
     clientCount: 8,
   },
   {
     id: 'emb-003',
     name: 'FleetControl Brasil',
     email: 'admin@fleetcontrol.com.br',
     phone: '(31) 97777-9999',
     cnpj: '45.678.901/0001-23',
     status: 'active',
     createdAt: new Date('2024-06-01'),
     settings: {
       logoUrl: '',
       primaryColor: '280 68% 60%', // Roxo
       companyName: 'FleetControl',
       moduleNames: {
         tracking: 'Localização',
         analytics: 'Dashboard IA',
       },
     },
     pricePerVehicle: 24.90,
     vehicleCount: 200,
     clientCount: 25,
   },
   {
     id: 'emb-004',
     name: 'GPS Nordeste',
     email: 'suporte@gpsnordeste.com.br',
     phone: '(85) 96666-4321',
     cnpj: '11.222.333/0001-44',
     status: 'pending',
     createdAt: new Date('2025-01-10'),
     settings: {
       logoUrl: '',
       primaryColor: '25 95% 53%', // Laranja
       companyName: 'GPS Nordeste',
     },
     pricePerVehicle: 27.90,
     vehicleCount: 45,
     clientCount: 5,
   },
 ];
 
 // Registros de veículos para cálculo pró-rata
 export const MOCK_VEHICLE_REGISTRATIONS: VehicleRegistration[] = [
   // TransLog - alguns veículos adicionados no meio do mês
   ...Array.from({ length: 95 }, (_, i) => ({
     vehicleId: `tl-vehicle-${i + 1}`,
     embarcadorId: 'emb-001',
     addedAt: new Date('2024-01-15'),
     isActive: true,
   })),
   ...Array.from({ length: 5 }, (_, i) => ({
     vehicleId: `tl-vehicle-new-${i + 1}`,
     embarcadorId: 'emb-001',
     addedAt: new Date('2025-02-15'), // Adicionados no dia 15
     isActive: true,
   })),
   
   // RastreioMax
   ...Array.from({ length: 70 }, (_, i) => ({
     vehicleId: `rm-vehicle-${i + 1}`,
     embarcadorId: 'emb-002',
     addedAt: new Date('2024-03-20'),
     isActive: true,
   })),
   ...Array.from({ length: 5 }, (_, i) => ({
     vehicleId: `rm-vehicle-new-${i + 1}`,
     embarcadorId: 'emb-002',
     addedAt: new Date('2025-02-10'), // Adicionados no dia 10
     isActive: true,
   })),
   
   // FleetControl
   ...Array.from({ length: 200 }, (_, i) => ({
     vehicleId: `fc-vehicle-${i + 1}`,
     embarcadorId: 'emb-003',
     addedAt: new Date('2024-06-01'),
     isActive: true,
   })),
   
   // GPS Nordeste
   ...Array.from({ length: 45 }, (_, i) => ({
     vehicleId: `gn-vehicle-${i + 1}`,
     embarcadorId: 'emb-004',
     addedAt: new Date('2025-01-10'),
     isActive: true,
   })),
 ];
 
 // Função para calcular fatura pró-rata
 export function calculateEmbarcadorInvoice(
   embarcador: Embarcador,
   registrations: VehicleRegistration[],
   targetMonth: Date
 ): EmbarcadorInvoice {
   const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
   const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
   const daysInMonth = monthEnd.getDate();
 
   const embarcadorRegs = registrations.filter(r => r.embarcadorId === embarcador.id && r.isActive);
   
   let fullVehicles = 0;
   const proRataGroups: Map<number, number> = new Map();
 
   embarcadorRegs.forEach(reg => {
     const addedDate = new Date(reg.addedAt);
     
     // Se foi adicionado antes do mês, conta integral
     if (addedDate < monthStart) {
       fullVehicles++;
     } else if (addedDate <= monthEnd) {
       // Calcula pró-rata
       const dayAdded = addedDate.getDate();
       const remainingDays = daysInMonth - dayAdded + 1;
       const percentage = Math.round((remainingDays / daysInMonth) * 100);
       
       const current = proRataGroups.get(percentage) || 0;
       proRataGroups.set(percentage, current + 1);
     }
   });
 
   // Converter Map para array
   const proRataVehicles = Array.from(proRataGroups.entries()).map(([percentage, count]) => ({
     percentage,
     count,
   }));
 
   // Calcular total
   let totalAmount = fullVehicles * embarcador.pricePerVehicle;
   proRataVehicles.forEach(({ percentage, count }) => {
     totalAmount += count * embarcador.pricePerVehicle * (percentage / 100);
   });
 
   return {
     embarcadorId: embarcador.id,
     month: `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`,
     fullVehicles,
     proRataVehicles,
     pricePerVehicle: embarcador.pricePerVehicle,
     totalAmount: Math.round(totalAmount * 100) / 100,
   };
 }
 
 // Função para obter embarcador por ID
 export function getEmbarcadorById(id: string): Embarcador | undefined {
   return MOCK_EMBARCADORES.find(e => e.id === id);
 }