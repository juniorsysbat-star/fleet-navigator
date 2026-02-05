 import { useState } from 'react';
 import { FileText } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
 import { ReportsCenterModal } from './ReportsCenterModal';
 
 export function ReportsFloatingButton() {
   const [isModalOpen, setIsModalOpen] = useState(false);
 
   return (
     <>
       <Tooltip delayDuration={0}>
         <TooltipTrigger asChild>
           <Button
             onClick={() => setIsModalOpen(true)}
             size="icon"
             className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all"
           >
             <FileText className="w-6 h-6" />
           </Button>
         </TooltipTrigger>
         <TooltipContent side="left">
           <span className="font-semibold">Relatórios / Exportar</span>
         </TooltipContent>
       </Tooltip>
 
       <ReportsCenterModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
       />
     </>
   );
 }