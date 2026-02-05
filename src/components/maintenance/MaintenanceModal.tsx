 import { useState, useEffect } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { MaintenanceFormData, MaintenanceTriggerType } from '@/types/maintenance';
 import { MOCK_VEHICLES } from '@/data/mockVehicles';
 import { Wrench, Car, Calendar, Gauge, FileText } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface MaintenanceModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (data: MaintenanceFormData) => void;
   preselectedVehicleId?: string;
 }
 
 const MAINTENANCE_TYPES = [
   'Troca de Óleo',
   'Revisão de Freios',
   'Troca de Pneus',
   'Alinhamento e Balanceamento',
   'Revisão Geral',
   'Troca de Filtros',
   'Revisão de Suspensão',
   'Troca de Correias',
   'Outros',
 ];
 
 export function MaintenanceModal({ isOpen, onClose, onSave, preselectedVehicleId }: MaintenanceModalProps) {
   const [formData, setFormData] = useState<MaintenanceFormData>({
     vehicleId: preselectedVehicleId || '',
     type: '',
     triggerType: 'date',
     triggerDate: '',
     triggerKm: undefined,
     notes: '',
   });
 
   useEffect(() => {
     if (isOpen) {
       setFormData({
         vehicleId: preselectedVehicleId || '',
         type: '',
         triggerType: 'date',
         triggerDate: '',
         triggerKm: undefined,
         notes: '',
       });
     }
   }, [isOpen, preselectedVehicleId]);
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     onSave(formData);
     onClose();
   };
 
   const handleTriggerTypeChange = (value: MaintenanceTriggerType) => {
     setFormData({ 
       ...formData, 
       triggerType: value,
       triggerDate: value === 'date' ? formData.triggerDate : '',
       triggerKm: value === 'odometer' ? formData.triggerKm : undefined,
     });
   };
 
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-[500px] bg-card border-border">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-foreground">
             <Wrench className="w-5 h-5 text-warning" />
             Agendar Manutenção
           </DialogTitle>
         </DialogHeader>
 
         <form onSubmit={handleSubmit} className="space-y-4">
           {/* Veículo */}
           <div className="space-y-2">
             <Label className="flex items-center gap-2 text-muted-foreground">
               <Car className="w-4 h-4" />
               Veículo *
             </Label>
             <Select
               value={formData.vehicleId}
               onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
               required
             >
               <SelectTrigger className="bg-secondary border-border">
                 <SelectValue placeholder="Selecione o veículo" />
               </SelectTrigger>
               <SelectContent>
                 {MOCK_VEHICLES.map((vehicle) => (
                   <SelectItem key={vehicle.device_id} value={vehicle.device_id}>
                     {vehicle.device_name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           {/* Tipo de Manutenção */}
           <div className="space-y-2">
             <Label className="flex items-center gap-2 text-muted-foreground">
               <Wrench className="w-4 h-4" />
               Tipo de Manutenção *
             </Label>
             <Select
               value={formData.type}
               onValueChange={(value) => setFormData({ ...formData, type: value })}
               required
             >
               <SelectTrigger className="bg-secondary border-border">
                 <SelectValue placeholder="Selecione o tipo" />
               </SelectTrigger>
               <SelectContent>
                 {MAINTENANCE_TYPES.map((type) => (
                   <SelectItem key={type} value={type}>
                     {type}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           {/* Tipo de Gatilho */}
           <div className="space-y-2">
             <Label className="text-muted-foreground">Regra de Gatilho *</Label>
             <div className="grid grid-cols-2 gap-3">
               <button
                 type="button"
                 onClick={() => handleTriggerTypeChange('date')}
                 className={cn(
                   "p-4 rounded-lg border-2 transition-all text-left",
                   formData.triggerType === 'date'
                     ? "border-accent bg-accent/10"
                     : "border-border bg-secondary hover:border-accent/50"
                 )}
               >
                 <Calendar className={cn(
                   "w-5 h-5 mb-2",
                   formData.triggerType === 'date' ? "text-accent" : "text-muted-foreground"
                 )} />
                 <p className={cn(
                   "font-semibold text-sm",
                   formData.triggerType === 'date' ? "text-accent" : "text-foreground"
                 )}>
                   Por Data
                 </p>
                 <p className="text-xs text-muted-foreground">
                   Ex: 20/12/2024
                 </p>
               </button>
 
               <button
                 type="button"
                 onClick={() => handleTriggerTypeChange('odometer')}
                 className={cn(
                   "p-4 rounded-lg border-2 transition-all text-left",
                   formData.triggerType === 'odometer'
                     ? "border-warning bg-warning/10"
                     : "border-border bg-secondary hover:border-warning/50"
                 )}
               >
                 <Gauge className={cn(
                   "w-5 h-5 mb-2",
                   formData.triggerType === 'odometer' ? "text-warning" : "text-muted-foreground"
                 )} />
                 <p className={cn(
                   "font-semibold text-sm",
                   formData.triggerType === 'odometer' ? "text-warning" : "text-foreground"
                 )}>
                   Por Hodômetro
                 </p>
                 <p className="text-xs text-muted-foreground">
                   Ex: A cada 10.000km
                 </p>
               </button>
             </div>
           </div>
 
           {/* Campo condicional baseado no tipo de gatilho */}
           {formData.triggerType === 'date' ? (
             <div className="space-y-2">
               <Label htmlFor="triggerDate" className="flex items-center gap-2 text-muted-foreground">
                 <Calendar className="w-4 h-4" />
                 Data da Manutenção *
               </Label>
               <Input
                 id="triggerDate"
                 type="date"
                 value={formData.triggerDate}
                 onChange={(e) => setFormData({ ...formData, triggerDate: e.target.value })}
                 required
                 className="bg-secondary border-border"
               />
             </div>
           ) : (
             <div className="space-y-2">
               <Label htmlFor="triggerKm" className="flex items-center gap-2 text-muted-foreground">
                 <Gauge className="w-4 h-4" />
                 Quilometragem Alvo *
               </Label>
               <Input
                 id="triggerKm"
                 type="number"
                 value={formData.triggerKm || ''}
                 onChange={(e) => setFormData({ ...formData, triggerKm: parseInt(e.target.value) || undefined })}
                 placeholder="Ex: 150000"
                 required
                 className="bg-secondary border-border"
               />
               <p className="text-xs text-muted-foreground">
                 O sistema alertará quando o veículo atingir 90% da quilometragem
               </p>
             </div>
           )}
 
           {/* Observações */}
           <div className="space-y-2">
             <Label htmlFor="notes" className="flex items-center gap-2 text-muted-foreground">
               <FileText className="w-4 h-4" />
               Observações (opcional)
             </Label>
             <Textarea
               id="notes"
               value={formData.notes}
               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
               placeholder="Ex: Usar óleo sintético 15W40"
               rows={3}
               className="bg-secondary border-border resize-none"
             />
           </div>
 
           <DialogFooter className="pt-4">
             <Button type="button" variant="outline" onClick={onClose}>
               Cancelar
             </Button>
             <Button type="submit" className="bg-warning text-warning-foreground hover:bg-warning/90">
               Agendar Manutenção
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 }