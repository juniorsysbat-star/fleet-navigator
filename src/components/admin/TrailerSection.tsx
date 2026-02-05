 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Trailer, TrailerType } from '@/types/vehicle';
 import { Plus, Trash2, Truck, Container, Box } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { MercosulPlate, validatePlate } from './MercosulPlate';
 
 interface TrailerSectionProps {
   trailers: Trailer[];
   onChange: (trailers: Trailer[]) => void;
   maxTrailers?: number;
 }
 
 const TRAILER_TYPES: { type: TrailerType; label: string }[] = [
   { type: 'bau', label: 'Baú' },
   { type: 'sider', label: 'Sider' },
   { type: 'graneleiro', label: 'Graneleiro' },
   { type: 'tanque', label: 'Tanque' },
   { type: 'cegonha', label: 'Cegonha' },
   { type: 'prancha', label: 'Prancha' },
 ];
 
 export function TrailerSection({ trailers, onChange, maxTrailers = 2 }: TrailerSectionProps) {
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const addTrailer = () => {
     if (trailers.length >= maxTrailers) return;
     
     const newTrailer: Trailer = {
       id: `trailer-${Date.now()}`,
       plate: '',
       type: 'bau',
       documentExpiry: '',
     };
     onChange([...trailers, newTrailer]);
   };
 
   const updateTrailer = (id: string, field: keyof Trailer, value: string) => {
     onChange(
       trailers.map(t => t.id === id ? { ...t, [field]: value } : t)
     );
     
     // Validate plate
     if (field === 'plate') {
       const newErrors = { ...errors };
       if (value && !validatePlate(value)) {
         newErrors[id] = 'Formato inválido';
       } else {
         delete newErrors[id];
       }
       setErrors(newErrors);
     }
   };
 
   const removeTrailer = (id: string) => {
     onChange(trailers.filter(t => t.id !== id));
     const newErrors = { ...errors };
     delete newErrors[id];
     setErrors(newErrors);
   };
 
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
         <Label className="flex items-center gap-2 text-accent">
           <Container className="w-4 h-4" />
           Engates / Carretas
         </Label>
         {trailers.length < maxTrailers && (
           <Button
             type="button"
             variant="outline"
             size="sm"
             onClick={addTrailer}
             className="gap-1 text-accent border-accent/30 hover:bg-accent/10"
           >
             <Plus className="w-4 h-4" />
             Adicionar Engate
           </Button>
         )}
       </div>
 
       {/* Visual Schema */}
       <div className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary/30 rounded-lg border border-border/50">
         <div className="flex items-center gap-1 px-3 py-2 bg-accent/20 rounded-lg border border-accent/30">
           <Truck className="w-5 h-5 text-accent" />
           <span className="text-xs font-medium text-accent">Cavalo</span>
         </div>
         
         {trailers.map((trailer, index) => (
           <div key={trailer.id} className="flex items-center gap-1">
             <div className="w-4 h-0.5 bg-muted-foreground" />
             <div className={cn(
               "flex items-center gap-1 px-3 py-2 rounded-lg border",
               trailer.plate 
                 ? "bg-success/20 border-success/30"
                 : "bg-secondary border-border"
             )}>
               <Box className={cn(
                 "w-4 h-4",
                 trailer.plate ? "text-success" : "text-muted-foreground"
               )} />
               <span className={cn(
                 "text-xs font-medium",
                 trailer.plate ? "text-success" : "text-muted-foreground"
               )}>
                 {trailer.plate || `Engate ${index + 1}`}
               </span>
             </div>
           </div>
         ))}
         
         {trailers.length === 0 && (
           <span className="text-xs text-muted-foreground ml-2">
             (Nenhum engate configurado)
           </span>
         )}
       </div>
 
       {/* Trailer Forms */}
       {trailers.map((trailer, index) => (
         <div 
           key={trailer.id}
           className="p-4 bg-secondary/30 rounded-lg border border-border space-y-3"
         >
           <div className="flex items-center justify-between">
             <span className="text-sm font-medium text-foreground">
               Engate {index + 1}
             </span>
             <Button
               type="button"
               variant="ghost"
               size="sm"
               onClick={() => removeTrailer(trailer.id)}
               className="text-destructive hover:bg-destructive/10"
             >
               <Trash2 className="w-4 h-4" />
             </Button>
           </div>
 
           <div className="grid grid-cols-2 gap-3">
             {/* Plate */}
             <div className="space-y-1">
               <Label className="text-xs text-muted-foreground">Placa *</Label>
               <Input
                 value={trailer.plate}
                 onChange={(e) => updateTrailer(
                   trailer.id, 
                   'plate', 
                   e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8)
                 )}
                 placeholder="ABC1D23"
                 className={cn(
                   "text-center font-mono",
                   errors[trailer.id] ? 'border-destructive' : ''
                 )}
               />
               {errors[trailer.id] && (
                 <p className="text-xs text-destructive">{errors[trailer.id]}</p>
               )}
             </div>
 
             {/* Type */}
             <div className="space-y-1">
               <Label className="text-xs text-muted-foreground">Tipo</Label>
               <Select
                 value={trailer.type}
                 onValueChange={(v) => updateTrailer(trailer.id, 'type', v)}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {TRAILER_TYPES.map(t => (
                     <SelectItem key={t.type} value={t.type}>
                       {t.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           {/* Document Expiry */}
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground">
               Vencimento Documento
             </Label>
             <Input
               type="date"
               value={trailer.documentExpiry}
               onChange={(e) => updateTrailer(trailer.id, 'documentExpiry', e.target.value)}
             />
           </div>
 
           {/* Plate Preview */}
           {trailer.plate && validatePlate(trailer.plate) && (
            <MercosulPlate plate={trailer.plate} className="scale-75 origin-left" />
           )}
         </div>
       ))}
 
       {trailers.length === 0 && (
         <p className="text-xs text-center text-muted-foreground py-2">
           Clique em "Adicionar Engate" para configurar Bitrem, Rodotrem ou Vanderléia
         </p>
       )}
 
       {trailers.length > 0 && trailers.length < maxTrailers && (
         <p className="text-xs text-center text-muted-foreground">
           Você pode adicionar até {maxTrailers} engates (Bitrem/Rodotrem)
         </p>
       )}
     </div>
   );
 }