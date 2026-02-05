 import { useState, useEffect } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { useAuth } from '@/contexts/AuthContext';
 import { MOCK_DRIVERS } from '@/data/mockDrivers';
 import { MOCK_MAINTENANCES } from '@/data/mockMaintenances';
 import { 
   AlertTriangle, 
   CreditCard, 
   Wrench, 
   Car, 
   FileText,
   Calendar,
   CheckCircle2
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { differenceInDays, parseISO } from 'date-fns';
 
 interface PendingItem {
   id: string;
   type: 'cnh' | 'maintenance' | 'ipva' | 'insurance' | 'licensing';
   title: string;
   description: string;
   daysUntil: number;
   severity: 'critical' | 'warning' | 'info';
 }
 
 // Mock de documentos de veículos vencendo
 const MOCK_VEHICLE_DOCS = [
   { vehicleId: 'mock-001', vehicleName: 'Caminhão 01', ipvaExpiry: '2025-02-10', insuranceExpiry: '2025-02-15' },
   { vehicleId: 'mock-002', vehicleName: 'Carro 02', ipvaExpiry: '2025-03-01', insuranceExpiry: '2025-01-20' },
   { vehicleId: 'mock-003', vehicleName: 'Van 03', ipvaExpiry: '2025-04-15', insuranceExpiry: '2025-02-08' },
 ];
 
 export function PendingItemsModal() {
   const { isAuthenticated } = useAuth();
   const [isOpen, setIsOpen] = useState(false);
   const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
   const [hasShown, setHasShown] = useState(false);
 
   useEffect(() => {
     if (isAuthenticated && !hasShown) {
       // Calcula itens pendentes
       const items: PendingItem[] = [];
       const today = new Date();
 
       // CNH de motoristas
       MOCK_DRIVERS.forEach(driver => {
         const expiryDate = parseISO(driver.cnhExpiry);
         const daysUntil = differenceInDays(expiryDate, today);
         
         if (daysUntil <= 7) {
           items.push({
             id: `cnh-${driver.id}`,
             type: 'cnh',
             title: `CNH - ${driver.name}`,
             description: daysUntil < 0 
               ? `Vencida há ${Math.abs(daysUntil)} dias`
               : daysUntil === 0 
                 ? 'Vence hoje!'
                 : `Vence em ${daysUntil} dias`,
             daysUntil,
             severity: daysUntil < 0 ? 'critical' : daysUntil <= 3 ? 'warning' : 'info',
           });
         }
       });
 
       // Manutenções
       MOCK_MAINTENANCES.forEach(maintenance => {
         if (maintenance.status === 'overdue' || maintenance.status === 'due') {
           let daysUntil = 0;
           if (maintenance.triggerType === 'date' && maintenance.triggerDate) {
             daysUntil = differenceInDays(parseISO(maintenance.triggerDate), today);
           } else {
             daysUntil = maintenance.status === 'overdue' ? -1 : 3;
           }
 
           items.push({
             id: `maint-${maintenance.id}`,
             type: 'maintenance',
             title: `${maintenance.type} - ${maintenance.vehicleName}`,
             description: maintenance.status === 'overdue' 
               ? 'Manutenção atrasada!'
               : 'Próximo do limite',
             daysUntil,
             severity: maintenance.status === 'overdue' ? 'critical' : 'warning',
           });
         }
       });
 
       // IPVA e Seguro
       MOCK_VEHICLE_DOCS.forEach(doc => {
         const ipvaDays = differenceInDays(parseISO(doc.ipvaExpiry), today);
         const insuranceDays = differenceInDays(parseISO(doc.insuranceExpiry), today);
 
         if (ipvaDays <= 7) {
           items.push({
             id: `ipva-${doc.vehicleId}`,
             type: 'ipva',
             title: `IPVA - ${doc.vehicleName}`,
             description: ipvaDays < 0 
               ? `Vencido há ${Math.abs(ipvaDays)} dias`
               : `Vence em ${ipvaDays} dias`,
             daysUntil: ipvaDays,
             severity: ipvaDays < 0 ? 'critical' : ipvaDays <= 3 ? 'warning' : 'info',
           });
         }
 
         if (insuranceDays <= 7) {
           items.push({
             id: `insurance-${doc.vehicleId}`,
             type: 'insurance',
             title: `Seguro - ${doc.vehicleName}`,
             description: insuranceDays < 0 
               ? `Vencido há ${Math.abs(insuranceDays)} dias`
               : `Vence em ${insuranceDays} dias`,
             daysUntil: insuranceDays,
             severity: insuranceDays < 0 ? 'critical' : insuranceDays <= 3 ? 'warning' : 'info',
           });
         }
       });
 
       // Ordena por severidade e dias
       items.sort((a, b) => {
         const severityOrder = { critical: 0, warning: 1, info: 2 };
         if (severityOrder[a.severity] !== severityOrder[b.severity]) {
           return severityOrder[a.severity] - severityOrder[b.severity];
         }
         return a.daysUntil - b.daysUntil;
       });
 
       setPendingItems(items);
 
       // Mostra o modal após 2 segundos do login se houver itens
       if (items.length > 0) {
         const timer = setTimeout(() => {
           setIsOpen(true);
           setHasShown(true);
         }, 2000);
         return () => clearTimeout(timer);
       }
     }
   }, [isAuthenticated, hasShown]);
 
   const getIcon = (type: PendingItem['type']) => {
     switch (type) {
       case 'cnh':
         return <CreditCard className="w-4 h-4" />;
       case 'maintenance':
         return <Wrench className="w-4 h-4" />;
       case 'ipva':
         return <Car className="w-4 h-4" />;
       case 'insurance':
         return <FileText className="w-4 h-4" />;
       case 'licensing':
         return <Calendar className="w-4 h-4" />;
     }
   };
 
   const criticalCount = pendingItems.filter(i => i.severity === 'critical').length;
   const warningCount = pendingItems.filter(i => i.severity === 'warning').length;
 
   if (pendingItems.length === 0) return null;
 
   return (
     <Dialog open={isOpen} onOpenChange={setIsOpen}>
       <DialogContent className="sm:max-w-[500px] bg-card border-border">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-foreground">
             <AlertTriangle className="w-5 h-5 text-warning" />
             Atenção Necessária
           </DialogTitle>
         </DialogHeader>
 
         {/* Summary */}
         <div className="flex gap-3 mb-4">
           {criticalCount > 0 && (
             <Badge variant="destructive" className="gap-1">
               <AlertTriangle className="w-3 h-3" />
               {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
             </Badge>
           )}
           {warningCount > 0 && (
             <Badge className="bg-warning text-warning-foreground gap-1">
               <AlertTriangle className="w-3 h-3" />
               {warningCount} Aviso{warningCount > 1 ? 's' : ''}
             </Badge>
           )}
         </div>
 
         <ScrollArea className="max-h-[400px] pr-4">
           <div className="space-y-3">
             {pendingItems.map((item) => (
               <div
                 key={item.id}
                 className={cn(
                   "p-3 rounded-lg border flex items-start gap-3 transition-colors",
                   item.severity === 'critical' && "bg-destructive/10 border-destructive/30",
                   item.severity === 'warning' && "bg-warning/10 border-warning/30",
                   item.severity === 'info' && "bg-accent/10 border-accent/30"
                 )}
               >
                 <div className={cn(
                   "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                   item.severity === 'critical' && "bg-destructive/20 text-destructive",
                   item.severity === 'warning' && "bg-warning/20 text-warning",
                   item.severity === 'info' && "bg-accent/20 text-accent"
                 )}>
                   {getIcon(item.type)}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-medium text-sm text-foreground truncate">
                     {item.title}
                   </p>
                   <p className={cn(
                     "text-xs",
                     item.severity === 'critical' && "text-destructive",
                     item.severity === 'warning' && "text-warning",
                     item.severity === 'info' && "text-muted-foreground"
                   )}>
                     {item.description}
                   </p>
                 </div>
               </div>
             ))}
           </div>
         </ScrollArea>
 
         <DialogFooter className="mt-4">
           <Button 
             onClick={() => setIsOpen(false)}
             className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
           >
             <CheckCircle2 className="w-4 h-4" />
             Ciente - Vou Verificar
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }