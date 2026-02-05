 import { useState, useEffect } from 'react';
 import { X, Cpu, Hash, Phone, Smartphone } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 
 export interface DeviceFormData {
   id?: string;
   name: string;
   imei: string;
   model: string;
   simPhone: string;
 }
 
 interface DeviceModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (device: DeviceFormData) => void;
   editDevice?: DeviceFormData | null;
 }
 
 const DEVICE_MODELS = [
   'Suntech ST300',
   'Queclink GV300',
   'Teltonika FMB920',
   'Coban GPS103',
   'Concox GT06N',
   'Meitrack T333',
   'Outro',
 ];
 
 export const DeviceModal = ({ isOpen, onClose, onSave, editDevice }: DeviceModalProps) => {
   const [name, setName] = useState('');
   const [imei, setImei] = useState('');
   const [model, setModel] = useState('');
   const [simPhone, setSimPhone] = useState('');
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   useEffect(() => {
     if (editDevice) {
       setName(editDevice.name);
       setImei(editDevice.imei);
       setModel(editDevice.model);
       setSimPhone(editDevice.simPhone);
     } else {
       resetForm();
     }
   }, [editDevice, isOpen]);
 
   const resetForm = () => {
     setName('');
     setImei('');
     setModel('');
     setSimPhone('');
     setErrors({});
   };
 
   const validate = (): boolean => {
     const newErrors: Record<string, string> = {};
     
     if (!name.trim()) {
       newErrors.name = 'Nome é obrigatório';
     }
     
     if (!imei.trim()) {
       newErrors.imei = 'IMEI é obrigatório';
     } else if (!/^\d{15}$/.test(imei.trim())) {
       newErrors.imei = 'IMEI deve ter 15 dígitos numéricos';
     }
     
     if (!model) {
       newErrors.model = 'Modelo é obrigatório';
     }
     
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!validate()) return;
 
     onSave({
       id: editDevice?.id,
       name: name.trim(),
       imei: imei.trim(),
       model,
       simPhone: simPhone.trim(),
     });
     
     onClose();
     resetForm();
   };
 
   if (!isOpen) return null;
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center">
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
       
       <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
         {/* Header */}
         <div className="flex items-center justify-between p-4 border-b border-border">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
               <Cpu className="w-5 h-5 text-accent" />
             </div>
             <div>
               <h2 className="font-display text-lg font-bold text-foreground">
                 {editDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}
               </h2>
               <p className="text-xs text-muted-foreground">Cadastre um rastreador GPS</p>
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
           {/* Name */}
           <div className="space-y-2">
             <Label htmlFor="device-name" className="flex items-center gap-2">
               <Smartphone className="w-4 h-4" />
               Nome do Veículo *
             </Label>
             <Input
               id="device-name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Ex: Caminhão 01"
               className={errors.name ? 'border-destructive' : ''}
             />
             {errors.name && (
               <p className="text-xs text-destructive">{errors.name}</p>
             )}
           </div>
 
           {/* IMEI */}
           <div className="space-y-2">
             <Label htmlFor="device-imei" className="flex items-center gap-2">
               <Hash className="w-4 h-4" />
               Identificador (IMEI) *
             </Label>
             <Input
               id="device-imei"
               value={imei}
               onChange={(e) => {
                 const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                 setImei(val);
               }}
               placeholder="Ex: 123456789012345"
               maxLength={15}
               className={errors.imei ? 'border-destructive' : ''}
             />
             {errors.imei && (
               <p className="text-xs text-destructive">{errors.imei}</p>
             )}
             <p className="text-xs text-muted-foreground">
               {imei.length}/15 dígitos
             </p>
           </div>
 
           {/* Model */}
           <div className="space-y-2">
             <Label htmlFor="device-model" className="flex items-center gap-2">
               <Cpu className="w-4 h-4" />
               Modelo *
             </Label>
             <Select value={model} onValueChange={setModel}>
               <SelectTrigger className={errors.model ? 'border-destructive' : ''}>
                 <SelectValue placeholder="Selecione o modelo" />
               </SelectTrigger>
               <SelectContent>
                 {DEVICE_MODELS.map(m => (
                   <SelectItem key={m} value={m}>{m}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             {errors.model && (
               <p className="text-xs text-destructive">{errors.model}</p>
             )}
           </div>
 
           {/* SIM Phone */}
           <div className="space-y-2">
             <Label htmlFor="device-phone" className="flex items-center gap-2">
               <Phone className="w-4 h-4" />
               Telefone do Chip (opcional)
             </Label>
             <Input
               id="device-phone"
               value={simPhone}
               onChange={(e) => setSimPhone(e.target.value)}
               placeholder="Ex: +55 11 99999-9999"
             />
           </div>
 
           {/* Actions */}
           <div className="flex gap-3 pt-4">
             <Button type="button" variant="outline" onClick={onClose} className="flex-1">
               Cancelar
             </Button>
             <Button 
               type="submit" 
               className="flex-1 bg-accent hover:bg-accent/90"
             >
               {editDevice ? 'Atualizar' : 'Adicionar Dispositivo'}
             </Button>
           </div>
         </form>
       </div>
     </div>
   );
 };