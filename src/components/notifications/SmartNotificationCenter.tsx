 import { useEffect, useRef, useCallback } from 'react';
 import { toast } from '@/hooks/use-toast';
 import { useAuth } from '@/contexts/AuthContext';
 import { AlertTriangle, AlertCircle, Siren, MapPin, Gauge } from 'lucide-react';
 
 // Tipos de alertas críticos
 type CriticalAlertType = 'sos' | 'geofence' | 'speed' | 'maintenance' | 'cnh';
 
 interface CriticalAlert {
   id: string;
   type: CriticalAlertType;
   title: string;
   message: string;
   vehicleName?: string;
   driverName?: string;
   timestamp: Date;
 }
 
 // Mock de alertas críticos para simulação
 const MOCK_CRITICAL_ALERTS: Omit<CriticalAlert, 'id' | 'timestamp'>[] = [
   {
     type: 'speed',
     title: 'Excesso de Velocidade',
     message: 'Veículo ultrapassou 120 km/h na BR-116',
     vehicleName: 'Caminhão ABC-1234',
     driverName: 'Carlos Silva',
   },
   {
     type: 'geofence',
     title: 'Violação de Cerca Virtual',
     message: 'Saiu da área permitida: "Centro de Distribuição SP"',
     vehicleName: 'Van XYZ-5678',
     driverName: 'Maria Santos',
   },
   {
     type: 'sos',
     title: '⚠️ BOTÃO DE PÂNICO',
     message: 'Motorista acionou botão SOS!',
     vehicleName: 'Moto 04',
     driverName: 'João Oliveira',
   },
 ];
 
 export function SmartNotificationCenter() {
   const { isAuthenticated } = useAuth();
   const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);
   const hasShownInitialAlerts = useRef(false);
 
   const getAlertIcon = (type: CriticalAlertType) => {
     switch (type) {
       case 'sos':
         return <Siren className="w-5 h-5 text-destructive animate-pulse" />;
       case 'geofence':
         return <MapPin className="w-5 h-5 text-warning" />;
       case 'speed':
         return <Gauge className="w-5 h-5 text-warning" />;
       case 'maintenance':
         return <AlertCircle className="w-5 h-5 text-accent" />;
       case 'cnh':
         return <AlertTriangle className="w-5 h-5 text-destructive" />;
       default:
         return <AlertCircle className="w-5 h-5" />;
     }
   };
 
   const showCriticalAlert = useCallback((alert: CriticalAlert) => {
     const variant = alert.type === 'sos' ? 'destructive' : 'default';
     
     toast({
       title: (
         <div className="flex items-center gap-2">
           {getAlertIcon(alert.type)}
           <span>{alert.title}</span>
         </div>
       ) as unknown as string,
       description: (
         <div className="space-y-1">
           <p>{alert.message}</p>
           {alert.vehicleName && (
             <p className="text-xs opacity-70">🚗 {alert.vehicleName}</p>
           )}
           {alert.driverName && (
             <p className="text-xs opacity-70">👤 {alert.driverName}</p>
           )}
         </div>
       ) as unknown as string,
       variant,
       duration: alert.type === 'sos' ? 15000 : 8000,
     });
   }, []);
 
   // Simula alertas críticos em tempo real
   useEffect(() => {
     if (!isAuthenticated) {
       if (alertIntervalRef.current) {
         clearInterval(alertIntervalRef.current);
       }
       return;
     }
 
     // Simula alertas aleatórios a cada 45-90 segundos
     const scheduleNextAlert = () => {
       const delay = 45000 + Math.random() * 45000; // 45-90 segundos
       alertIntervalRef.current = setTimeout(() => {
         const randomAlert = MOCK_CRITICAL_ALERTS[Math.floor(Math.random() * MOCK_CRITICAL_ALERTS.length)];
         showCriticalAlert({
           ...randomAlert,
           id: `alert-${Date.now()}`,
           timestamp: new Date(),
         });
         scheduleNextAlert();
       }, delay);
     };
 
     // Mostra um alerta inicial após 15 segundos do login (apenas uma vez)
     if (!hasShownInitialAlerts.current) {
       hasShownInitialAlerts.current = true;
       setTimeout(() => {
         if (isAuthenticated) {
           showCriticalAlert({
             id: 'initial-alert',
             type: 'speed',
             title: 'Excesso de Velocidade',
             message: 'Veículo atingiu 125 km/h na Rodovia Bandeirantes',
             vehicleName: 'Caminhão 01 - ABC1D23',
             driverName: 'Carlos Silva',
             timestamp: new Date(),
           });
         }
       }, 15000);
     }
 
     scheduleNextAlert();
 
     return () => {
       if (alertIntervalRef.current) {
         clearTimeout(alertIntervalRef.current);
       }
     };
   }, [isAuthenticated, showCriticalAlert]);
 
   return null; // Componente invisível, apenas dispara toasts
 }