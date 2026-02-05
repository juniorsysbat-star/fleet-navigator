 import { useState, useMemo } from 'react';
 import { 
   Fuel, 
   TrendingDown, 
   TrendingUp, 
   DollarSign, 
   Gauge, 
   Plus, 
   AlertTriangle,
   Pencil,
   Trash2,
   ChevronRight
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import { 
   Table, 
   TableBody, 
   TableCell, 
   TableHead, 
   TableHeader, 
   TableRow 
 } from '@/components/ui/table';
 import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   PieChart,
   Pie,
   Cell,
   Legend,
 } from 'recharts';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { 
   FuelRecord, 
   MOCK_FUEL_RECORDS, 
   calculateFuelMetrics,
   getConsumptionTrend,
   getCostByVehicle,
   getCostPerKmTrend,
   FUEL_TYPE_LABELS,
 } from '@/data/mockFuelRecords';
 import { FuelEntryModal } from './FuelEntryModal';
 
 const CHART_COLORS = [
   'hsl(var(--accent))',
   'hsl(var(--success))',
   'hsl(var(--warning))',
   'hsl(var(--destructive))',
   'hsl(var(--primary))',
 ];
 
 export const FuelDashboard = () => {
   const [records, setRecords] = useState<FuelRecord[]>(MOCK_FUEL_RECORDS);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null);
 
   // Calculate metrics
   const metrics = useMemo(() => calculateFuelMetrics(records), [records]);
   const consumptionTrend = useMemo(() => getConsumptionTrend(records), [records]);
   const costByVehicle = useMemo(() => getCostByVehicle(records), [records]);
   const costPerKmTrend = useMemo(() => getCostPerKmTrend(records), [records]);
 
   // Check if consumption is getting worse
   const isConsumptionWorsening = useMemo(() => {
     if (consumptionTrend.length < 2) return false;
     const lastTwo = consumptionTrend.slice(-2);
     return lastTwo[1].kmPerLiter! < lastTwo[0].kmPerLiter!;
   }, [consumptionTrend]);
 
   const handleAddRecord = (newRecord: Omit<FuelRecord, 'id'>) => {
     const record: FuelRecord = {
       ...newRecord,
       id: `fuel-${Date.now()}`,
     };
     setRecords(prev => [...prev, record]);
   };
 
   const handleEditRecord = (record: FuelRecord) => {
     setEditingRecord(record);
     setIsModalOpen(true);
   };
 
   const handleUpdateRecord = (updatedRecord: Omit<FuelRecord, 'id'>) => {
     if (!editingRecord) return;
     setRecords(prev => 
       prev.map(r => r.id === editingRecord.id ? { ...updatedRecord, id: editingRecord.id } : r)
     );
     setEditingRecord(null);
   };
 
   const handleDeleteRecord = (id: string) => {
     setRecords(prev => prev.filter(r => r.id !== id));
   };
 
   const handleCloseModal = () => {
     setIsModalOpen(false);
     setEditingRecord(null);
   };
 
   return (
     <div className="space-y-6">
       {/* Header with Add Button */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning/20 to-accent/20 flex items-center justify-center border border-warning/30">
             <Fuel className="w-5 h-5 text-warning" />
           </div>
           <div>
             <h2 className="font-display text-xl font-bold text-foreground">Economia & Combustível</h2>
             <p className="text-xs text-muted-foreground">Controle de abastecimentos e análise de custos</p>
           </div>
         </div>
         <Button 
           onClick={() => setIsModalOpen(true)}
           className="bg-accent hover:bg-accent/90"
         >
           <Plus className="w-4 h-4 mr-2" />
           Novo Abastecimento
         </Button>
       </div>
 
       {/* Summary Cards */}
       {metrics && (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 rounded-xl bg-card border border-border">
             <div className="flex items-center gap-2 mb-2">
               <Gauge className="w-4 h-4 text-success" />
               <span className="text-xs text-muted-foreground">Média Km/L</span>
             </div>
             <div className="flex items-center gap-2">
               <p className="text-2xl font-display font-bold text-success">{metrics.avgKmPerLiter}</p>
               {isConsumptionWorsening && (
                 <div className="flex items-center gap-1 text-destructive">
                   <TrendingDown className="w-4 h-4" />
                   <span className="text-xs">Piorando</span>
                 </div>
               )}
             </div>
           </div>
 
           <div className="p-4 rounded-xl bg-card border border-border">
             <div className="flex items-center gap-2 mb-2">
               <DollarSign className="w-4 h-4 text-warning" />
               <span className="text-xs text-muted-foreground">Custo/Km</span>
             </div>
             <p className="text-2xl font-display font-bold text-warning">R$ {metrics.avgCostPerKm}</p>
           </div>
 
           <div className="p-4 rounded-xl bg-card border border-border">
             <div className="flex items-center gap-2 mb-2">
               <Fuel className="w-4 h-4 text-accent" />
               <span className="text-xs text-muted-foreground">Total Litros</span>
             </div>
             <p className="text-2xl font-display font-bold text-foreground">{metrics.totalLiters.toLocaleString()}L</p>
           </div>
 
           <div className="p-4 rounded-xl bg-card border border-border">
             <div className="flex items-center gap-2 mb-2">
               <DollarSign className="w-4 h-4 text-destructive" />
               <span className="text-xs text-muted-foreground">Total Gasto</span>
             </div>
             <p className="text-2xl font-display font-bold text-foreground">
               R$ {metrics.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </p>
           </div>
         </div>
       )}
 
       {/* Charts Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Consumption Trend (Km/L) */}
         <div className="rounded-xl bg-card border border-border p-5">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <Gauge className="w-5 h-5 text-success" />
               <h3 className="font-display font-bold text-foreground">Evolução do Consumo (Km/L)</h3>
             </div>
             {isConsumptionWorsening && (
               <div className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/10 text-destructive text-xs">
                 <AlertTriangle className="w-3 h-3" />
                 Consumo Piorando
               </div>
             )}
           </div>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={consumptionTrend}>
                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                 <XAxis 
                   dataKey="date" 
                   stroke="hsl(var(--muted-foreground))"
                   tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                 />
                 <YAxis 
                   stroke="hsl(var(--muted-foreground))"
                   tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                   domain={['auto', 'auto']}
                 />
                 <Tooltip
                   contentStyle={{
                     backgroundColor: 'hsl(var(--card))',
                     border: '1px solid hsl(var(--border))',
                     borderRadius: '8px',
                     color: 'hsl(var(--foreground))',
                   }}
                   formatter={(value: number) => [`${value.toFixed(2)} km/L`, 'Consumo']}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="kmPerLiter" 
                   stroke="hsl(var(--success))" 
                   strokeWidth={2}
                   dot={{ fill: 'hsl(var(--success))', strokeWidth: 2 }}
                   activeDot={{ r: 6 }}
                 />
               </LineChart>
             </ResponsiveContainer>
           </div>
         </div>
 
         {/* Cost per Km Trend */}
         <div className="rounded-xl bg-card border border-border p-5">
           <div className="flex items-center gap-2 mb-4">
             <DollarSign className="w-5 h-5 text-warning" />
             <h3 className="font-display font-bold text-foreground">Custo por Km (R$/Km)</h3>
           </div>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={costPerKmTrend}>
                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                 <XAxis 
                   dataKey="date" 
                   stroke="hsl(var(--muted-foreground))"
                   tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                 />
                 <YAxis 
                   stroke="hsl(var(--muted-foreground))"
                   tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                   tickFormatter={(value) => `R$${value}`}
                 />
                 <Tooltip
                   contentStyle={{
                     backgroundColor: 'hsl(var(--card))',
                     border: '1px solid hsl(var(--border))',
                     borderRadius: '8px',
                     color: 'hsl(var(--foreground))',
                   }}
                   formatter={(value: number) => [`R$ ${value.toFixed(2)}/km`, 'Custo']}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="costPerKm" 
                   stroke="hsl(var(--warning))" 
                   strokeWidth={2}
                   dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2 }}
                   activeDot={{ r: 6 }}
                 />
               </LineChart>
             </ResponsiveContainer>
           </div>
         </div>
 
         {/* Spending by Vehicle (Pie Chart) */}
         <div className="rounded-xl bg-card border border-border p-5 lg:col-span-2">
           <div className="flex items-center gap-2 mb-4">
             <Fuel className="w-5 h-5 text-accent" />
             <h3 className="font-display font-bold text-foreground">Distribuição de Gastos por Veículo</h3>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={costByVehicle}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={2}
                   dataKey="value"
                   label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                   labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                 >
                   {costByVehicle.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip
                   contentStyle={{
                     backgroundColor: 'hsl(var(--card))',
                     border: '1px solid hsl(var(--border))',
                     borderRadius: '8px',
                     color: 'hsl(var(--foreground))',
                   }}
                   formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gasto']}
                 />
                 <Legend 
                   verticalAlign="bottom"
                   formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
         </div>
       </div>
 
       {/* History Table */}
       <div className="rounded-xl bg-card border border-border p-5">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <Fuel className="w-5 h-5 text-accent" />
             <h3 className="font-display font-bold text-foreground">Histórico de Abastecimentos</h3>
           </div>
           <span className="text-xs text-muted-foreground">{records.length} registros</span>
         </div>
 
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Data</TableHead>
                 <TableHead>Veículo</TableHead>
                 <TableHead>Tipo</TableHead>
                 <TableHead className="text-right">Litros</TableHead>
                 <TableHead className="text-right">R$/L</TableHead>
                 <TableHead className="text-right">Total</TableHead>
                 <TableHead className="text-right">Km/L</TableHead>
                 <TableHead className="text-right">R$/Km</TableHead>
                 <TableHead className="text-right">Ações</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {records
                 .sort((a, b) => b.date.getTime() - a.date.getTime())
                 .map((record) => (
                   <TableRow key={record.id} className="hover:bg-secondary/30">
                     <TableCell className="text-sm">
                       {format(record.date, 'dd/MM/yyyy', { locale: ptBR })}
                     </TableCell>
                     <TableCell className="font-medium">{record.vehicleName}</TableCell>
                     <TableCell>
                       <span className={cn(
                         "px-2 py-0.5 rounded text-xs font-medium",
                         record.fuelType === 'diesel' && "bg-warning/10 text-warning",
                         record.fuelType === 'gasoline' && "bg-accent/10 text-accent",
                         record.fuelType === 'ethanol' && "bg-success/10 text-success",
                       )}>
                         {FUEL_TYPE_LABELS[record.fuelType]}
                       </span>
                     </TableCell>
                     <TableCell className="text-right">{record.liters}L</TableCell>
                     <TableCell className="text-right">R$ {record.pricePerLiter.toFixed(2)}</TableCell>
                     <TableCell className="text-right font-medium">
                       R$ {record.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </TableCell>
                     <TableCell className="text-right">
                       {record.kmPerLiter ? (
                         <span className="text-success">{record.kmPerLiter.toFixed(1)}</span>
                       ) : (
                         <span className="text-muted-foreground">-</span>
                       )}
                     </TableCell>
                     <TableCell className="text-right">
                       {record.costPerKm ? (
                         <span className="text-warning">R$ {record.costPerKm.toFixed(2)}</span>
                       ) : (
                         <span className="text-muted-foreground">-</span>
                       )}
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <button
                           onClick={() => handleEditRecord(record)}
                           className="p-1.5 rounded hover:bg-secondary transition-colors"
                           title="Editar"
                         >
                           <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                         </button>
                         <button
                           onClick={() => handleDeleteRecord(record.id)}
                           className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                           title="Excluir"
                         >
                           <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                         </button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
             </TableBody>
           </Table>
         </div>
       </div>
 
       {/* Modal */}
       <FuelEntryModal
         isOpen={isModalOpen}
         onClose={handleCloseModal}
         onSave={editingRecord ? handleUpdateRecord : handleAddRecord}
         editRecord={editingRecord}
       />
     </div>
   );
 };