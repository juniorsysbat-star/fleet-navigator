 import { useState } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { Checkbox } from '@/components/ui/checkbox';
 import { 
   FileText, 
   Download, 
   Fuel, 
   Wrench, 
   Route, 
   Users,
   FileSpreadsheet,
   FileDown
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { toast } from '@/hooks/use-toast';
 
 interface ReportsCenterModalProps {
   isOpen: boolean;
   onClose: () => void;
 }
 
 type ReportType = 'fuel' | 'maintenance' | 'trips' | 'drivers';
 type ExportFormat = 'pdf' | 'excel';
 
 const REPORT_OPTIONS = [
   { id: 'fuel' as ReportType, label: 'Abastecimentos', description: 'Combustível e custos', icon: Fuel, color: 'text-warning' },
   { id: 'maintenance' as ReportType, label: 'Manutenções', description: 'Realizadas e pendentes', icon: Wrench, color: 'text-accent' },
   { id: 'trips' as ReportType, label: 'Viagens e Rotas', description: 'Histórico de trajetos', icon: Route, color: 'text-success' },
   { id: 'drivers' as ReportType, label: 'Ranking de Motoristas', description: 'Comportamento e pontuação', icon: Users, color: 'text-primary' },
 ];
 
 export function ReportsCenterModal({ isOpen, onClose }: ReportsCenterModalProps) {
   const [selectedReports, setSelectedReports] = useState<ReportType[]>([]);
   const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
   const [isExporting, setIsExporting] = useState(false);
 
   const toggleReport = (reportId: ReportType) => {
     setSelectedReports(prev => 
       prev.includes(reportId) 
         ? prev.filter(r => r !== reportId)
         : [...prev, reportId]
     );
   };
 
   const handleExport = async () => {
     if (selectedReports.length === 0) {
       toast({
         title: 'Selecione ao menos um relatório',
         variant: 'destructive',
       });
       return;
     }
 
     setIsExporting(true);
     
     // Simula exportação
     await new Promise(resolve => setTimeout(resolve, 1500));
     
     const reportNames = selectedReports.map(r => 
       REPORT_OPTIONS.find(o => o.id === r)?.label
     ).join(', ');
 
     toast({
       title: `Relatório ${exportFormat.toUpperCase()} gerado!`,
       description: `${reportNames} exportado com sucesso.`,
     });
 
     // Simula download
     const fileName = `relatorio_frota_${new Date().toISOString().split('T')[0]}.${exportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
     
     // Cria um blob simulado para download
     const blob = new Blob(['Relatório simulado'], { type: exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = fileName;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
 
     setIsExporting(false);
     onClose();
     setSelectedReports([]);
   };
 
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-[550px] bg-card border-border">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-foreground">
             <FileText className="w-5 h-5 text-accent" />
             Central de Relatórios
           </DialogTitle>
         </DialogHeader>
 
         <div className="space-y-6 py-4">
           {/* Tipo de Relatório */}
           <div className="space-y-3">
             <Label className="text-muted-foreground">Selecione os relatórios:</Label>
             <div className="grid grid-cols-2 gap-3">
               {REPORT_OPTIONS.map((option) => {
                 const Icon = option.icon;
                 const isSelected = selectedReports.includes(option.id);
                 
                 return (
                   <button
                     key={option.id}
                     type="button"
                     onClick={() => toggleReport(option.id)}
                     className={cn(
                       "p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3",
                       isSelected
                         ? "border-accent bg-accent/10"
                         : "border-border bg-secondary hover:border-accent/50"
                     )}
                   >
                     <div className={cn(
                       "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                       isSelected ? "bg-accent/20" : "bg-background"
                     )}>
                       <Icon className={cn("w-4 h-4", option.color)} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className={cn(
                         "font-semibold text-sm",
                         isSelected ? "text-accent" : "text-foreground"
                       )}>
                         {option.label}
                       </p>
                       <p className="text-xs text-muted-foreground truncate">
                         {option.description}
                       </p>
                     </div>
                     <Checkbox 
                       checked={isSelected} 
                       className="mt-1"
                     />
                   </button>
                 );
               })}
             </div>
           </div>
 
           {/* Formato de Exportação */}
           <div className="space-y-3">
             <Label className="text-muted-foreground">Formato de exportação:</Label>
             <div className="grid grid-cols-2 gap-3">
               <button
                 type="button"
                 onClick={() => setExportFormat('pdf')}
                 className={cn(
                   "p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                   exportFormat === 'pdf'
                     ? "border-destructive bg-destructive/10"
                     : "border-border bg-secondary hover:border-destructive/50"
                 )}
               >
                 <FileDown className={cn(
                   "w-6 h-6",
                   exportFormat === 'pdf' ? "text-destructive" : "text-muted-foreground"
                 )} />
                 <div className="text-left">
                   <p className={cn(
                     "font-semibold",
                     exportFormat === 'pdf' ? "text-destructive" : "text-foreground"
                   )}>
                     PDF
                   </p>
                   <p className="text-xs text-muted-foreground">Visual/Impressão</p>
                 </div>
               </button>
 
               <button
                 type="button"
                 onClick={() => setExportFormat('excel')}
                 className={cn(
                   "p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                   exportFormat === 'excel'
                     ? "border-success bg-success/10"
                     : "border-border bg-secondary hover:border-success/50"
                 )}
               >
                 <FileSpreadsheet className={cn(
                   "w-6 h-6",
                   exportFormat === 'excel' ? "text-success" : "text-muted-foreground"
                 )} />
                 <div className="text-left">
                   <p className={cn(
                     "font-semibold",
                     exportFormat === 'excel' ? "text-success" : "text-foreground"
                   )}>
                     Excel/CSV
                   </p>
                   <p className="text-xs text-muted-foreground">Dados/Análise</p>
                 </div>
               </button>
             </div>
           </div>
         </div>
 
         <DialogFooter>
           <Button type="button" variant="outline" onClick={onClose}>
             Cancelar
           </Button>
           <Button 
             onClick={handleExport}
             disabled={selectedReports.length === 0 || isExporting}
             className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
           >
             {isExporting ? (
               <>
                 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                 Gerando...
               </>
             ) : (
               <>
                 <Download className="w-4 h-4" />
                 Exportar Relatório
               </>
             )}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }