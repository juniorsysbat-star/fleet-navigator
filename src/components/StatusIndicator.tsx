 import { useState, useEffect } from 'react';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
 import { cn } from '@/lib/utils';
 
 type ConnectionStatus = 'online' | 'slow' | 'offline';
 
 interface ConnectionState {
   status: ConnectionStatus;
   latency: number;
 }
 
 export function StatusIndicator() {
   const [connection, setConnection] = useState<ConnectionState>({
     status: 'online',
     latency: 15,
   });
 
   useEffect(() => {
     const checkConnection = async () => {
       const start = performance.now();
       
       try {
         // Simula ping - em produção, faria fetch real para API
         await new Promise((resolve, reject) => {
           const timeout = setTimeout(() => reject(new Error('timeout')), 5000);
           
           // Simula latência variável para demo
           const simulatedLatency = Math.random() * 100 + 10;
           setTimeout(() => {
             clearTimeout(timeout);
             resolve(true);
           }, simulatedLatency);
         });
         
         const latency = Math.round(performance.now() - start);
         
         if (latency < 200) {
           setConnection({ status: 'online', latency });
         } else {
           setConnection({ status: 'slow', latency });
         }
       } catch {
         setConnection({ status: 'offline', latency: 0 });
       }
     };
 
     checkConnection();
     const interval = setInterval(checkConnection, 10000);
     
     return () => clearInterval(interval);
   }, []);
 
   const getStatusColor = () => {
     switch (connection.status) {
       case 'online':
         return 'bg-success';
       case 'slow':
         return 'bg-warning';
       case 'offline':
         return 'bg-destructive';
     }
   };
 
   const getStatusText = () => {
     switch (connection.status) {
       case 'online':
         return `Online (${connection.latency}ms)`;
       case 'slow':
         return `Latência Alta (${connection.latency}ms)`;
       case 'offline':
         return 'Offline';
     }
   };
 
   return (
     <Tooltip delayDuration={0}>
       <TooltipTrigger asChild>
         <div className="relative cursor-pointer">
           <span 
             className={cn(
               "block w-2.5 h-2.5 rounded-full transition-colors",
               getStatusColor()
             )}
           />
           {connection.status === 'online' && (
             <span 
               className={cn(
                 "absolute inset-0 rounded-full animate-ping opacity-75",
                 getStatusColor()
               )}
               style={{ animationDuration: '2s' }}
             />
           )}
         </div>
       </TooltipTrigger>
       <TooltipContent side="bottom" className="text-xs">
         <div className="flex items-center gap-2">
           <span className={cn("w-2 h-2 rounded-full", getStatusColor())} />
           <span>Status da Conexão: {getStatusText()}</span>
         </div>
       </TooltipContent>
     </Tooltip>
   );
 }