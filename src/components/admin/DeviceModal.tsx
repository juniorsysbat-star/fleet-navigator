 import { useState, useEffect, useMemo } from 'react';
 import { X, Cpu, Hash, Phone, Car, Bike, Truck, CarFront, Tractor, Bus, Palette, ChevronRight, Server, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { cn } from '@/lib/utils';
 import { VehicleType } from '@/types/vehicle';
 import { TRACKER_DATABASE, getManufacturerById, getModelById, SERVER_IP, TrackerModel } from '@/data/trackerDatabase';
 import { MercosulPlate, validatePlate } from './MercosulPlate';
 import { Alert, AlertDescription } from '@/components/ui/alert';

export interface DeviceFormData {
  id?: string;
  name: string;
   plate: string;
  imei: string;
  model: string;
   manufacturerId: string;
   modelId: string;
   port: number;
  simPhone: string;
  vehicleType: VehicleType;
  iconColor: string;
}

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: DeviceFormData) => void;
  editDevice?: DeviceFormData | null;
}

const VEHICLE_TYPES: { type: VehicleType; label: string; icon: typeof Car }[] = [
   { type: 'sedan', label: 'Carro', icon: Car },
   { type: 'motorcycle', label: 'Moto', icon: Bike },
   { type: 'truck', label: 'Caminhão', icon: Truck },
   { type: 'pickup', label: 'Pickup', icon: CarFront },
   { type: 'tractor', label: 'Trator', icon: Tractor },
   { type: 'bus', label: 'Ônibus', icon: Bus },
];

const ICON_COLORS = [
  { name: 'Status', value: 'status' },
  { name: 'Ciano', value: '#00ffff' },
  { name: 'Verde', value: '#00ff88' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Amarelo', value: '#fbbf24' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Roxo', value: '#a855f7' },
];

export const DeviceModal = ({ isOpen, onClose, onSave, editDevice }: DeviceModalProps) => {
   const [plate, setPlate] = useState('');
  const [imei, setImei] = useState('');
   const [manufacturerId, setManufacturerId] = useState('');
   const [modelId, setModelId] = useState('');
  const [simPhone, setSimPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [iconColor, setIconColor] = useState('status');
  const [errors, setErrors] = useState<Record<string, string>>({});
 
   // Derived state for selected model and port
   const selectedManufacturer = useMemo(() => 
     getManufacturerById(manufacturerId), [manufacturerId]);
   
   const selectedModel = useMemo(() => 
     getModelById(manufacturerId, modelId), [manufacturerId, modelId]);
   
   const availableModels = useMemo(() => 
     selectedManufacturer?.models || [], [selectedManufacturer]);

  useEffect(() => {
    if (editDevice) {
       setPlate(editDevice.plate || editDevice.name);
      setImei(editDevice.imei);
       setManufacturerId(editDevice.manufacturerId || '');
       setModelId(editDevice.modelId || '');
      setSimPhone(editDevice.simPhone);
      setVehicleType(editDevice.vehicleType || 'sedan');
      setIconColor(editDevice.iconColor || 'status');
    } else {
      resetForm();
    }
  }, [editDevice, isOpen]);

  const resetForm = () => {
     setPlate('');
    setImei('');
     setManufacturerId('');
     setModelId('');
    setSimPhone('');
    setVehicleType('sedan');
    setIconColor('status');
    setErrors({});
  };
 
   // Reset model when manufacturer changes
   useEffect(() => {
     if (!editDevice) {
       setModelId('');
     }
   }, [manufacturerId, editDevice]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
     if (!plate.trim()) {
       newErrors.plate = 'Placa é obrigatória';
     } else if (!validatePlate(plate)) {
       newErrors.plate = 'Formato inválido. Use AAA1A23 ou AAA-1234';
    }
    
    if (!imei.trim()) {
      newErrors.imei = 'IMEI é obrigatório';
    } else if (!/^\d{15}$/.test(imei.trim())) {
      newErrors.imei = 'IMEI deve ter 15 dígitos numéricos';
    }
    
     if (!manufacturerId) {
       newErrors.manufacturer = 'Selecione o fabricante';
     }
     
     if (!modelId) {
       newErrors.model = 'Selecione o modelo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
 
     const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    onSave({
      id: editDevice?.id,
       name: cleanPlate,
       plate: cleanPlate,
      imei: imei.trim(),
       model: selectedModel?.name || '',
       manufacturerId,
       modelId,
       port: selectedModel?.port || 5023,
      simPhone: simPhone.trim(),
      vehicleType,
      iconColor,
    });
    
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  const SelectedVehicleIcon = VEHICLE_TYPES.find(v => v.type === vehicleType)?.icon || Car;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg mx-4 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-cyber">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
              <Cpu className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {editDevice ? 'Editar Dispositivo' : 'Novo Dispositivo'}
              </h2>
               <p className="text-xs text-muted-foreground">Assistente inteligente de cadastro</p>
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
        <form onSubmit={handleSubmit} className="p-4 space-y-5">
           {/* Step 1: Manufacturer Selection */}
           <div className="space-y-3">
             <Label className="flex items-center gap-2 text-accent">
               <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">1</span>
               Fabricante do Rastreador
             </Label>
             <Select value={manufacturerId} onValueChange={setManufacturerId}>
               <SelectTrigger className={cn(
                 "h-12 text-base",
                 errors.manufacturer ? 'border-destructive' : '',
                 manufacturerId ? 'border-accent/50 bg-accent/5' : ''
               )}>
                 <SelectValue placeholder="Selecione o fabricante..." />
               </SelectTrigger>
               <SelectContent>
                 {TRACKER_DATABASE.map(manufacturer => (
                   <SelectItem key={manufacturer.id} value={manufacturer.id}>
                     <div className="flex items-center gap-2">
                       <Cpu className="w-4 h-4 text-muted-foreground" />
                       {manufacturer.name}
                     </div>
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             {errors.manufacturer && (
               <p className="text-xs text-destructive">{errors.manufacturer}</p>
             )}
           </div>
 
           {/* Step 2: Model Selection (only shown after manufacturer) */}
           {manufacturerId && (
             <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
               <Label className="flex items-center gap-2 text-accent">
                 <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">2</span>
                 Modelo Específico
               </Label>
               <Select value={modelId} onValueChange={setModelId}>
                 <SelectTrigger className={cn(
                   "h-12 text-base",
                   errors.model ? 'border-destructive' : '',
                   modelId ? 'border-accent/50 bg-accent/5' : ''
                 )}>
                   <SelectValue placeholder="Selecione o modelo..." />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectGroup>
                     <SelectLabel className="text-xs text-muted-foreground">
                       Modelos {selectedManufacturer?.name}
                     </SelectLabel>
                     {availableModels.map(model => (
                       <SelectItem key={model.id} value={model.id}>
                         <div className="flex items-center justify-between gap-4 w-full">
                           <span>{model.name}</span>
                           <span className="text-xs text-muted-foreground">Porta {model.port}</span>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectGroup>
                 </SelectContent>
               </Select>
               {errors.model && (
                 <p className="text-xs text-destructive">{errors.model}</p>
               )}
             </div>
           )}
 
           {/* Server Configuration Alert (shown after model selection) */}
           {selectedModel && (
             <Alert className="border-accent/30 bg-accent/5 animate-in slide-in-from-top-2 duration-200">
               <Server className="h-4 w-4 text-accent" />
               <AlertDescription className="text-sm">
                 <span className="font-semibold text-accent">Configure seu rastreador:</span>
                 <div className="mt-2 p-2 bg-background/50 rounded-md font-mono text-xs space-y-1">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Servidor:</span>
                     <span className="text-foreground font-semibold">{SERVER_IP}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Porta:</span>
                     <span className="text-accent font-bold">{selectedModel.port}</span>
                   </div>
                 </div>
               </AlertDescription>
             </Alert>
           )}
 
           {/* Plate Input with Mercosul Preview */}
           <div className="space-y-3">
             <Label htmlFor="device-plate" className="flex items-center gap-2">
               <Hash className="w-4 h-4" />
               Placa do Veículo *
             </Label>
             <Input
               id="device-plate"
               value={plate}
               onChange={(e) => {
                 const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
                 setPlate(val);
               }}
               placeholder="Ex: ABC1D23"
               maxLength={8}
               className={cn(
                 "text-center text-lg font-mono tracking-widest",
                 errors.plate ? 'border-destructive' : ''
               )}
             />
             {errors.plate && (
               <p className="text-xs text-destructive">{errors.plate}</p>
             )}
             
             {/* Mercosul Plate Preview */}
             <MercosulPlate plate={plate} />
           </div>
 
           {/* Icon Preview */}
          <div className="flex items-center justify-center p-4 bg-secondary/30 rounded-xl border border-border/50">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-300"
              style={{ 
                borderColor: iconColor === 'status' ? '#00ff88' : iconColor,
                boxShadow: `0 0 20px ${iconColor === 'status' ? 'rgba(0, 255, 136, 0.4)' : iconColor}40`,
                background: `linear-gradient(135deg, hsl(220 25% 12%) 0%, hsl(220 30% 8%) 100%)`
              }}
            >
              <SelectedVehicleIcon 
                className="w-8 h-8" 
                style={{ color: iconColor === 'status' ? '#00ff88' : iconColor }}
              />
            </div>
          </div>

          {/* Vehicle Type Selector */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Tipo de Veículo *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVehicleType(type)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                    "hover:bg-accent/10 hover:border-accent/50",
                    vehicleType === type
                      ? "bg-accent/20 border-accent shadow-[0_0_15px_hsl(var(--accent)/0.3)]"
                      : "bg-secondary/30 border-border/50"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors",
                      vehicleType === type ? "text-accent" : "text-muted-foreground"
                    )} 
                  />
                  <span className={cn(
                    "text-xs font-medium",
                    vehicleType === type ? "text-accent" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Color Selector */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cor do Ícone
            </Label>
            <div className="flex flex-wrap gap-2">
              {ICON_COLORS.map(({ name, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIconColor(value)}
                  className={cn(
                    "h-9 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
                    value === 'status' ? 'px-3' : 'w-9',
                    iconColor === value
                      ? "border-foreground scale-110 shadow-lg"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ 
                    backgroundColor: value === 'status' 
                      ? 'linear-gradient(135deg, #00ff88, #00ffff)' 
                      : value 
                  }}
                  title={name}
                >
                  {value === 'status' ? (
                    <span className="text-xs font-semibold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                      Auto
                    </span>
                  ) : iconColor === value && (
                    <div className="w-2 h-2 rounded-full bg-background" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              'Auto' segue a cor do status do veículo (em movimento, parado, offline)
            </p>
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

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-card/95 backdrop-blur-xl pb-2">
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
           
           {/* SIM Phone (collapsible advanced) */}
           <details className="group">
             <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
               <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
               Opções avançadas
             </summary>
             <div className="mt-3 space-y-3 animate-in slide-in-from-top-1">
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
             </div>
           </details>
        </form>
      </div>
    </div>
  );
};