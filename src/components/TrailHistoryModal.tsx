 import { useState } from 'react';
 import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { Calendar as CalendarIcon, Search, X, MapPin, Clock, Route, Flag, StopCircle } from 'lucide-react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Calendar } from '@/components/ui/calendar';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { cn } from '@/lib/utils';
 import { VehicleWithStatus } from '@/types/vehicle';
import { TrailPoint } from '@/types/trail';
 
 interface TrailHistoryModalProps {
   isOpen: boolean;
   onClose: () => void;
   vehicle: VehicleWithStatus;
   onTrailLoad: (trail: TrailPoint[]) => void;
 }
 
 export function TrailHistoryModal({ isOpen, onClose, vehicle, onTrailLoad }: TrailHistoryModalProps) {
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
   const [isLoading, setIsLoading] = useState(false);
   const [trailSummary, setTrailSummary] = useState<{
     totalKm: number;
     duration: string;
     stops: number;
     startTime: string;
     endTime: string;
   } | null>(null);
 
   const today = new Date();
   const minDate = subDays(today, 120);
 
   const handleDateSelect = (date: Date | undefined) => {
     setSelectedDate(date);
     setTrailSummary(null);
   };
 
   const handleSearch = async () => {
     if (!selectedDate) return;
 
     setIsLoading(true);
     
     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 800));
 
     // Generate realistic trail for selected date
     const trail = generateRealisticTrail(
       vehicle.latitude,
       vehicle.longitude,
       selectedDate
     );
 
     // Calculate summary
     const stops = trail.filter(p => p.isStop).length;
     const totalKm = trail.reduce((acc, point, i) => {
       if (i === 0) return 0;
       const prev = trail[i - 1];
       const dist = haversineDistance(prev.lat, prev.lng, point.lat, point.lng);
       return acc + dist;
     }, 0);
 
     const startTime = trail[0]?.timestamp;
     const endTime = trail[trail.length - 1]?.timestamp;
     const durationMs = endTime && startTime 
       ? new Date(endTime).getTime() - new Date(startTime).getTime()
       : 0;
     const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
     const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
 
     setTrailSummary({
       totalKm: Math.round(totalKm * 10) / 10,
       duration: `${durationHours}h ${durationMins}min`,
       stops,
       startTime: startTime ? format(new Date(startTime), 'HH:mm', { locale: ptBR }) : '--:--',
       endTime: endTime ? format(new Date(endTime), 'HH:mm', { locale: ptBR }) : '--:--',
     });
 
     onTrailLoad(trail);
     setIsLoading(false);
   };
 
   const handleClose = () => {
     setSelectedDate(undefined);
     setTrailSummary(null);
     onClose();
   };
 
   return (
     <Dialog open={isOpen} onOpenChange={handleClose}>
       <DialogContent className="sm:max-w-md bg-card border-border">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 font-display text-lg">
             <Route className="w-5 h-5 text-accent" />
             Histórico de Trajeto
           </DialogTitle>
         </DialogHeader>
 
         <div className="space-y-4">
           {/* Vehicle Info */}
           <div className="p-3 rounded-lg bg-secondary/50 border border-border">
             <p className="text-sm text-muted-foreground">Veículo</p>
             <p className="font-semibold text-foreground">{vehicle.device_name}</p>
           </div>
 
           {/* Date Picker */}
           <div className="space-y-2">
             <label className="text-sm font-medium text-foreground">
               Selecione a Data
             </label>
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className={cn(
                     "w-full justify-start text-left font-normal",
                     !selectedDate && "text-muted-foreground"
                   )}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {selectedDate ? (
                     format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                   ) : (
                     <span>Escolha uma data</span>
                   )}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <Calendar
                   mode="single"
                   selected={selectedDate}
                   onSelect={handleDateSelect}
                   disabled={(date) =>
                     isAfter(startOfDay(date), startOfDay(today)) ||
                     isBefore(startOfDay(date), startOfDay(minDate))
                   }
                   initialFocus
                   locale={ptBR}
                   className={cn("p-3 pointer-events-auto")}
                 />
               </PopoverContent>
             </Popover>
             <p className="text-xs text-muted-foreground">
               Disponível: últimos 120 dias
             </p>
           </div>
 
           {/* Search Button */}
           <Button
             onClick={handleSearch}
             disabled={!selectedDate || isLoading}
             className="w-full gap-2"
           >
             {isLoading ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Carregando...
               </>
             ) : (
               <>
                 <Search className="w-4 h-4" />
                 Buscar Trajeto
               </>
             )}
           </Button>
 
           {/* Trail Summary */}
           {trailSummary && (
             <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 space-y-3">
               <h4 className="font-semibold text-accent text-sm flex items-center gap-2">
                 <Flag className="w-4 h-4" />
                 Resumo do Trajeto
               </h4>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-muted-foreground" />
                   <div>
                     <p className="text-xs text-muted-foreground">Distância</p>
                     <p className="font-semibold text-foreground">{trailSummary.totalKm} km</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-muted-foreground" />
                   <div>
                     <p className="text-xs text-muted-foreground">Duração</p>
                     <p className="font-semibold text-foreground">{trailSummary.duration}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <StopCircle className="w-4 h-4 text-muted-foreground" />
                   <div>
                     <p className="text-xs text-muted-foreground">Paradas</p>
                     <p className="font-semibold text-foreground">{trailSummary.stops}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <Route className="w-4 h-4 text-muted-foreground" />
                   <div>
                     <p className="text-xs text-muted-foreground">Horário</p>
                     <p className="font-semibold text-foreground">
                       {trailSummary.startTime} - {trailSummary.endTime}
                     </p>
                   </div>
                 </div>
               </div>
 
               <div className="pt-2 border-t border-border/50">
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <span className="w-3 h-3 rounded-full bg-emerald-500" /> Início
                   <span className="mx-2">•</span>
                   <span className="w-3 h-3 rounded-full bg-blue-500" /> Trajeto
                   <span className="mx-2">•</span>
                   <span className="w-3 h-3 rounded-full bg-red-500" /> Paradas
                   <span className="mx-2">•</span>
                   <span className="w-3 h-3 rounded-full bg-amber-500" /> Fim
                 </p>
               </div>
             </div>
           )}
         </div>
       </DialogContent>
     </Dialog>
   );
 }
 
 // Haversine distance calculation in km
 function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
   const R = 6371;
   const dLat = (lat2 - lat1) * Math.PI / 180;
   const dLng = (lng2 - lng1) * Math.PI / 180;
   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng / 2) * Math.sin(dLng / 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   return R * c;
 }