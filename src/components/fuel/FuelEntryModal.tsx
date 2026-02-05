 import { useState, useEffect } from 'react';
 import { X, Upload, Fuel, Calculator } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Calendar } from '@/components/ui/calendar';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { CalendarIcon } from 'lucide-react';
 import { FuelRecord, FuelType, FUEL_TYPE_LABELS } from '@/data/mockFuelRecords';
 import { MOCK_VEHICLES } from '@/data/mockVehicles';
 
 interface FuelEntryModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (record: Omit<FuelRecord, 'id'>) => void;
   editRecord?: FuelRecord | null;
 }
 
 export const FuelEntryModal = ({ isOpen, onClose, onSave, editRecord }: FuelEntryModalProps) => {
   const [vehicleId, setVehicleId] = useState('');
   const [date, setDate] = useState<Date>(new Date());
   const [odometer, setOdometer] = useState('');
   const [liters, setLiters] = useState('');
   const [pricePerLiter, setPricePerLiter] = useState('');
   const [fuelType, setFuelType] = useState<FuelType>('gasoline');
   const [station, setStation] = useState('');
   const [lastOdometer, setLastOdometer] = useState<number | null>(null);
 
   // Calculate total cost automatically
   const totalCost = Number(liters) * Number(pricePerLiter) || 0;
 
   // Calculate km/l and cost/km
   const kmSinceLastFill = lastOdometer ? Number(odometer) - lastOdometer : null;
   const kmPerLiter = kmSinceLastFill && Number(liters) > 0 ? kmSinceLastFill / Number(liters) : null;
   const costPerKm = kmSinceLastFill && kmSinceLastFill > 0 ? totalCost / kmSinceLastFill : null;
 
   useEffect(() => {
     if (editRecord) {
       setVehicleId(editRecord.vehicleId);
       setDate(editRecord.date);
       setOdometer(editRecord.odometer.toString());
       setLiters(editRecord.liters.toString());
       setPricePerLiter(editRecord.pricePerLiter.toString());
       setFuelType(editRecord.fuelType);
       setStation(editRecord.station || '');
     } else {
       resetForm();
     }
   }, [editRecord, isOpen]);
 
   // Simulated last odometer fetch when vehicle changes
   useEffect(() => {
     if (vehicleId) {
       // In real app, fetch last odometer from API
       const mockLastOdometers: Record<string, number> = {
         'mock-001': 144520,
         'mock-002': 41960,
         'mock-003': 84745,
         'mock-004': 28720,
         'mock-005': 62275,
       };
       setLastOdometer(mockLastOdometers[vehicleId] || null);
     }
   }, [vehicleId]);
 
   const resetForm = () => {
     setVehicleId('');
     setDate(new Date());
     setOdometer('');
     setLiters('');
     setPricePerLiter('');
     setFuelType('gasoline');
     setStation('');
     setLastOdometer(null);
   };
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     const vehicle = MOCK_VEHICLES.find(v => v.device_id === vehicleId);
     if (!vehicle) return;
 
     const record: Omit<FuelRecord, 'id'> = {
       vehicleId,
       vehicleName: vehicle.device_name,
       date,
       odometer: Number(odometer),
       liters: Number(liters),
       pricePerLiter: Number(pricePerLiter),
       totalCost: Number(totalCost.toFixed(2)),
       fuelType,
       station: station || undefined,
       kmSinceLastFill: kmSinceLastFill || undefined,
       kmPerLiter: kmPerLiter ? Number(kmPerLiter.toFixed(2)) : undefined,
       costPerKm: costPerKm ? Number(costPerKm.toFixed(2)) : undefined,
     };
 
     onSave(record);
     onClose();
     resetForm();
   };
 
   if (!isOpen) return null;
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center">
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
       
       <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-cyber">
         {/* Header */}
         <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning/20 to-accent/20 flex items-center justify-center border border-warning/30">
               <Fuel className="w-5 h-5 text-warning" />
             </div>
             <div>
               <h2 className="font-display text-lg font-bold text-foreground">
                 {editRecord ? 'Editar Abastecimento' : 'Novo Abastecimento'}
               </h2>
               <p className="text-xs text-muted-foreground">Registre os dados do abastecimento</p>
             </div>
           </div>
           <button
             onClick={onClose}
             className="p-2 rounded-lg hover:bg-secondary transition-colors"
           >
             <X className="w-5 h-5 text-muted-foreground" />
           </button>
         </div>
 
         {/* Form */}
         <form onSubmit={handleSubmit} className="p-4 space-y-4">
           {/* Vehicle Selection */}
           <div className="space-y-2">
             <Label htmlFor="vehicle">Veículo *</Label>
             <Select value={vehicleId} onValueChange={setVehicleId} required>
               <SelectTrigger>
                 <SelectValue placeholder="Selecione o veículo" />
               </SelectTrigger>
               <SelectContent>
                 {MOCK_VEHICLES.map(v => (
                   <SelectItem key={v.device_id} value={v.device_id}>
                     {v.device_name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           {/* Date/Time */}
           <div className="space-y-2">
             <Label>Data/Hora *</Label>
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className={cn(
                     "w-full justify-start text-left font-normal",
                     !date && "text-muted-foreground"
                   )}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {date ? format(date, "PPP 'às' HH:mm", { locale: ptBR }) : <span>Selecione a data</span>}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <Calendar
                   mode="single"
                   selected={date}
                   onSelect={(d) => d && setDate(d)}
                   initialFocus
                   className="p-3 pointer-events-auto"
                 />
               </PopoverContent>
             </Popover>
           </div>
 
           {/* Odometer */}
           <div className="space-y-2">
             <Label htmlFor="odometer">Odômetro (Km) *</Label>
             <div className="relative">
               <Input
                 id="odometer"
                 type="number"
                 value={odometer}
                 onChange={(e) => setOdometer(e.target.value)}
                 placeholder="Ex: 145000"
                 required
                 min={lastOdometer || 0}
               />
               {lastOdometer && (
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                   Último: {lastOdometer.toLocaleString()} km
                 </span>
               )}
             </div>
           </div>
 
           {/* Liters and Price Row */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="liters">Litros *</Label>
               <Input
                 id="liters"
                 type="number"
                 step="0.01"
                 value={liters}
                 onChange={(e) => setLiters(e.target.value)}
                 placeholder="Ex: 50.5"
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="price">Preço/Litro (R$) *</Label>
               <Input
                 id="price"
                 type="number"
                 step="0.01"
                 value={pricePerLiter}
                 onChange={(e) => setPricePerLiter(e.target.value)}
                 placeholder="Ex: 5.89"
                 required
               />
             </div>
           </div>
 
           {/* Total Cost (Auto-calculated) */}
           <div className="p-4 rounded-lg bg-secondary/50 border border-border">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-accent" />
                 <span className="text-sm text-muted-foreground">Valor Total</span>
               </div>
               <span className="font-display text-xl font-bold text-foreground">
                 R$ {totalCost.toFixed(2)}
               </span>
             </div>
             
             {/* Calculated metrics */}
             {kmSinceLastFill && kmSinceLastFill > 0 && (
               <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-4 text-xs">
                 <div>
                   <span className="text-muted-foreground">Km rodados:</span>
                   <span className="ml-2 text-foreground font-semibold">{kmSinceLastFill} km</span>
                 </div>
                 {kmPerLiter && (
                   <div>
                     <span className="text-muted-foreground">Consumo:</span>
                     <span className="ml-2 text-success font-semibold">{kmPerLiter.toFixed(2)} km/L</span>
                   </div>
                 )}
                 {costPerKm && (
                   <div className="col-span-2">
                     <span className="text-muted-foreground">Custo por Km:</span>
                     <span className="ml-2 text-warning font-semibold">R$ {costPerKm.toFixed(2)}/km</span>
                   </div>
                 )}
               </div>
             )}
           </div>
 
           {/* Fuel Type */}
           <div className="space-y-2">
             <Label>Tipo de Combustível *</Label>
             <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => (
                   <SelectItem key={key} value={key}>
                     {label}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           {/* Station (Optional) */}
           <div className="space-y-2">
             <Label htmlFor="station">Posto/Local (opcional)</Label>
             <Input
               id="station"
               value={station}
               onChange={(e) => setStation(e.target.value)}
               placeholder="Ex: Posto Shell - Av. Paulista"
             />
           </div>
 
           {/* Photo Upload (Visual only) */}
           <div className="space-y-2">
             <Label>Foto da Nota (opcional)</Label>
             <button
               type="button"
               className="w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-accent/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
             >
               <Upload className="w-8 h-8" />
               <span className="text-sm">Clique para anexar foto</span>
               <span className="text-xs text-muted-foreground">(Em breve)</span>
             </button>
           </div>
 
           {/* Actions */}
           <div className="flex gap-3 pt-4">
             <Button type="button" variant="outline" onClick={onClose} className="flex-1">
               Cancelar
             </Button>
             <Button 
               type="submit" 
               className="flex-1 bg-accent hover:bg-accent/90"
               disabled={!vehicleId || !odometer || !liters || !pricePerLiter}
             >
               {editRecord ? 'Atualizar' : 'Salvar Abastecimento'}
             </Button>
           </div>
         </form>
       </div>
     </div>
   );
 };