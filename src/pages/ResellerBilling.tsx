 import { useState } from 'react';
 import { 
   Building2,
   DollarSign,
   Car,
   Users,
   TrendingUp,
   Calendar,
   Edit2,
   Save,
   X,
   Calculator,
   AlertTriangle,
   CheckCircle2
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { cn } from '@/lib/utils';
 import { 
   MOCK_EMBARCADORES, 
   MOCK_VEHICLE_REGISTRATIONS,
   calculateEmbarcadorInvoice
 } from '@/data/mockEmbarcadores';
 import { Embarcador } from '@/types/user';
 import { useAuth } from '@/contexts/AuthContext';
 import { toast } from 'sonner';
 
 const ResellerBilling = () => {
   const { user } = useAuth();
   const [embarcadores, setEmbarcadores] = useState(MOCK_EMBARCADORES);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [editPrice, setEditPrice] = useState<number>(0);
   const [selectedMonth, setSelectedMonth] = useState(new Date());
 
   // Apenas Super Admin pode ver esta página
   if (!user || user.role !== 'super_admin') {
     return (
       <div className="h-full flex items-center justify-center bg-background">
         <div className="text-center">
           <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
           <p className="text-muted-foreground">Esta página é exclusiva para Super Administradores.</p>
         </div>
       </div>
     );
   }
 
   const handleEditPrice = (embarcador: Embarcador) => {
     setEditingId(embarcador.id);
     setEditPrice(embarcador.pricePerVehicle);
   };
 
   const handleSavePrice = (id: string) => {
     setEmbarcadores(embarcadores.map(e => 
       e.id === id ? { ...e, pricePerVehicle: editPrice } : e
     ));
     setEditingId(null);
     toast.success('Preço atualizado com sucesso!');
   };
 
   const handleCancelEdit = () => {
     setEditingId(null);
     setEditPrice(0);
   };
 
   // Calcula totais
   const totals = embarcadores.reduce((acc, emb) => {
     const invoice = calculateEmbarcadorInvoice(emb, MOCK_VEHICLE_REGISTRATIONS, selectedMonth);
     return {
       totalVehicles: acc.totalVehicles + emb.vehicleCount,
       totalClients: acc.totalClients + emb.clientCount,
       totalRevenue: acc.totalRevenue + invoice.totalAmount,
       activeEmbarcadores: acc.activeEmbarcadores + (emb.status === 'active' ? 1 : 0),
     };
   }, { totalVehicles: 0, totalClients: 0, totalRevenue: 0, activeEmbarcadores: 0 });
 
   return (
     <div className="h-full overflow-y-auto bg-background p-6 scrollbar-cyber">
       {/* Header */}
       <div className="mb-6">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-accent/20 flex items-center justify-center border border-purple-500/30">
               <Building2 className="w-6 h-6 text-purple-500" />
             </div>
             <div>
               <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
                 FINANCEIRO DA REVENDA
               </h1>
               <p className="text-sm text-muted-foreground">
                 Gestão de faturamento dos Embarcadores
               </p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-muted-foreground" />
             <span className="text-sm text-muted-foreground">
               Período: {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
             </span>
           </div>
         </div>
       </div>
 
       {/* Summary Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-card border border-purple-500/30">
           <div className="flex items-center justify-between mb-3">
             <Building2 className="w-8 h-8 text-purple-500" />
             <span className="text-xs text-purple-500 bg-purple-500/20 px-2 py-1 rounded">Ativos</span>
           </div>
           <p className="text-3xl font-display font-bold text-foreground">{totals.activeEmbarcadores}</p>
           <p className="text-xs text-muted-foreground mt-1">Embarcadores</p>
         </div>
         
         <div className="p-5 rounded-xl bg-gradient-to-br from-accent/10 to-card border border-accent/30">
           <div className="flex items-center justify-between mb-3">
             <Car className="w-8 h-8 text-accent" />
           </div>
           <p className="text-3xl font-display font-bold text-foreground">{totals.totalVehicles}</p>
           <p className="text-xs text-muted-foreground mt-1">Veículos Rastreados</p>
         </div>
         
         <div className="p-5 rounded-xl bg-gradient-to-br from-warning/10 to-card border border-warning/30">
           <div className="flex items-center justify-between mb-3">
             <Users className="w-8 h-8 text-warning" />
           </div>
           <p className="text-3xl font-display font-bold text-warning">{totals.totalClients}</p>
           <p className="text-xs text-muted-foreground mt-1">Clientes Finais</p>
         </div>
         
         <div className="p-5 rounded-xl bg-gradient-to-br from-success/10 to-card border border-success/30">
           <div className="flex items-center justify-between mb-3">
             <DollarSign className="w-8 h-8 text-success" />
             <TrendingUp className="w-4 h-4 text-success" />
           </div>
           <p className="text-3xl font-display font-bold text-success">
             R$ {totals.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </p>
           <p className="text-xs text-muted-foreground mt-1">Faturamento Estimado</p>
         </div>
       </div>
 
       {/* Embarcadores List */}
       <div className="rounded-xl bg-card border border-border">
         <div className="p-4 border-b border-border">
           <h2 className="font-display font-bold text-lg flex items-center gap-2">
             <Calculator className="w-5 h-5 text-accent" />
             Cálculo de Faturas por Embarcador
           </h2>
           <p className="text-xs text-muted-foreground mt-1">
             Edite o preço por placa e veja o cálculo pró-rata automático
           </p>
         </div>
 
         <div className="divide-y divide-border">
           {embarcadores.map((embarcador) => {
             const invoice = calculateEmbarcadorInvoice(embarcador, MOCK_VEHICLE_REGISTRATIONS, selectedMonth);
             const isEditing = editingId === embarcador.id;
 
             return (
               <div key={embarcador.id} className="p-5 hover:bg-secondary/30 transition-all">
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-4">
                     <div 
                       className="w-12 h-12 rounded-xl flex items-center justify-center border"
                       style={{ 
                         backgroundColor: `hsl(${embarcador.settings.primaryColor} / 0.2)`,
                         borderColor: `hsl(${embarcador.settings.primaryColor} / 0.4)`,
                       }}
                     >
                       <Building2 
                         className="w-6 h-6"
                         style={{ color: `hsl(${embarcador.settings.primaryColor})` }}
                       />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h3 className="font-semibold text-foreground">{embarcador.name}</h3>
                         <span className={cn(
                           "px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border",
                           embarcador.status === 'active' 
                             ? "bg-success/20 text-success border-success/30"
                             : "bg-warning/20 text-warning border-warning/30"
                         )}>
                           {embarcador.status === 'active' ? 'Ativo' : 'Pendente'}
                         </span>
                       </div>
                       <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                         <span>{embarcador.email}</span>
                         <span>CNPJ: {embarcador.cnpj}</span>
                       </div>
                     </div>
                   </div>
 
                   {/* Price Editor */}
                   <div className="flex items-center gap-3">
                     <div className="text-right">
                       <p className="text-xs text-muted-foreground mb-1">Preço por Placa</p>
                       {isEditing ? (
                         <div className="flex items-center gap-2">
                           <span className="text-sm text-muted-foreground">R$</span>
                           <Input
                             type="number"
                             step="0.01"
                             value={editPrice}
                             onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                             className="w-24 h-8 text-right"
                           />
                           <Button
                             size="icon"
                             variant="ghost"
                             className="h-8 w-8 text-success hover:text-success"
                             onClick={() => handleSavePrice(embarcador.id)}
                           >
                             <Save className="w-4 h-4" />
                           </Button>
                           <Button
                             size="icon"
                             variant="ghost"
                             className="h-8 w-8 text-destructive hover:text-destructive"
                             onClick={handleCancelEdit}
                           >
                             <X className="w-4 h-4" />
                           </Button>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <span className="font-display text-xl font-bold text-accent">
                             R$ {embarcador.pricePerVehicle.toFixed(2)}
                           </span>
                           <Button
                             size="icon"
                             variant="ghost"
                             className="h-8 w-8"
                             onClick={() => handleEditPrice(embarcador)}
                           >
                             <Edit2 className="w-4 h-4" />
                           </Button>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
 
                 {/* Invoice Calculation */}
                 <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                     <div>
                       <p className="text-xs text-muted-foreground">Veículos Ativos</p>
                       <p className="font-display text-xl font-bold text-foreground">{embarcador.vehicleCount}</p>
                     </div>
                     <div>
                       <p className="text-xs text-muted-foreground">Clientes</p>
                       <p className="font-display text-xl font-bold text-foreground">{embarcador.clientCount}</p>
                     </div>
                     <div>
                       <p className="text-xs text-muted-foreground">Veículos Integrais</p>
                       <p className="font-display text-xl font-bold text-success">{invoice.fullVehicles}</p>
                     </div>
                     <div>
                       <p className="text-xs text-muted-foreground">Veículos Pró-Rata</p>
                       <p className="font-display text-xl font-bold text-warning">
                         {invoice.proRataVehicles.reduce((acc, v) => acc + v.count, 0)}
                       </p>
                     </div>
                   </div>
 
                   {/* Calculation Breakdown */}
                   <div className="bg-background/50 rounded-lg p-3 border border-border mb-3">
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                       Detalhamento do Cálculo
                     </p>
                     <div className="space-y-1 text-sm">
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">
                           {invoice.fullVehicles} veículos × R$ {invoice.pricePerVehicle.toFixed(2)} (100%)
                         </span>
                         <span className="font-mono text-foreground">
                           R$ {(invoice.fullVehicles * invoice.pricePerVehicle).toFixed(2)}
                         </span>
                       </div>
                       {invoice.proRataVehicles.map((pr, idx) => (
                         <div key={idx} className="flex justify-between text-warning">
                           <span>
                             {pr.count} veículo(s) × R$ {invoice.pricePerVehicle.toFixed(2)} × {pr.percentage}% (pró-rata)
                           </span>
                           <span className="font-mono">
                             R$ {(pr.count * invoice.pricePerVehicle * pr.percentage / 100).toFixed(2)}
                           </span>
                         </div>
                       ))}
                     </div>
                   </div>
 
                   {/* Total */}
                   <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
                     <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-success" />
                       <span className="font-semibold text-success">Fatura Estimada do Mês</span>
                     </div>
                     <span className="font-display text-2xl font-bold text-success">
                       R$ {invoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </span>
                   </div>
                 </div>
               </div>
             );
           })}
         </div>
       </div>
     </div>
   );
 };
 
 export default ResellerBilling;