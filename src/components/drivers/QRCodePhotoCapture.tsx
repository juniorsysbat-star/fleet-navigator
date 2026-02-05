 import { useState, useEffect } from 'react';
 import { QRCodeSVG } from 'qrcode.react';
 import { Button } from '@/components/ui/button';
 import { Smartphone, RefreshCw, Check, X } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface QRCodePhotoCaptureProps {
   onPhotoCapture: (photoUrl: string) => void;
   onCancel: () => void;
 }
 
 export function QRCodePhotoCapture({ onPhotoCapture, onCancel }: QRCodePhotoCaptureProps) {
   const [sessionId] = useState(() => `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
   const [status, setStatus] = useState<'waiting' | 'connected' | 'captured'>('waiting');
   const [countdown, setCountdown] = useState(120); // 2 minutos
   
   // URL simulada para o mobile (em produção seria um endpoint real)
   const captureUrl = `${window.location.origin}/mobile-photo/${sessionId}`;
   
   // Simula a conexão WebSocket e recebimento da foto
   useEffect(() => {
     // Simula alguém escaneando após 3 segundos
     const connectTimer = setTimeout(() => {
       setStatus('connected');
       
       // Simula a captura da foto após mais 4 segundos
       const captureTimer = setTimeout(() => {
         setStatus('captured');
         // Foto simulada de avatar genérico
         const simulatedPhotoUrl = `https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face&t=${Date.now()}`;
         
         setTimeout(() => {
           onPhotoCapture(simulatedPhotoUrl);
         }, 1000);
       }, 4000);
       
       return () => clearTimeout(captureTimer);
     }, 3000);
     
     return () => clearTimeout(connectTimer);
   }, [onPhotoCapture]);
   
   // Countdown timer
   useEffect(() => {
     if (status === 'captured') return;
     
     const timer = setInterval(() => {
       setCountdown(prev => {
         if (prev <= 1) {
           clearInterval(timer);
           onCancel();
           return 0;
         }
         return prev - 1;
       });
     }, 1000);
     
     return () => clearInterval(timer);
   }, [status, onCancel]);
   
   const formatTime = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs.toString().padStart(2, '0')}`;
   };
 
   return (
     <div className="flex flex-col items-center space-y-4 p-4">
       {/* Status Header */}
       <div className="flex items-center gap-2">
         <div className={cn(
           "w-3 h-3 rounded-full animate-pulse",
           status === 'waiting' && "bg-warning",
           status === 'connected' && "bg-accent",
           status === 'captured' && "bg-success"
         )} />
         <span className="text-sm font-medium text-foreground">
           {status === 'waiting' && 'Aguardando conexão...'}
           {status === 'connected' && 'Celular conectado! Aguardando foto...'}
           {status === 'captured' && 'Foto capturada com sucesso!'}
         </span>
       </div>
       
       {/* QR Code */}
       <div className={cn(
         "bg-white p-4 rounded-xl shadow-lg transition-all",
         status === 'captured' && "opacity-50"
       )}>
         {status === 'captured' ? (
           <div className="w-48 h-48 flex items-center justify-center bg-success/20 rounded-lg">
             <Check className="w-16 h-16 text-success" />
           </div>
         ) : (
           <QRCodeSVG 
             value={captureUrl}
             size={192}
             level="H"
             includeMargin
             imageSettings={{
               src: "/favicon.ico",
               x: undefined,
               y: undefined,
               height: 24,
               width: 24,
               excavate: true,
             }}
           />
         )}
       </div>
       
       {/* Instructions */}
       {status !== 'captured' && (
         <div className="text-center space-y-2">
           <div className="flex items-center justify-center gap-2 text-muted-foreground">
             <Smartphone className="w-4 h-4" />
             <span className="text-sm">Peça ao motorista escanear com o celular</span>
           </div>
           <p className="text-xs text-muted-foreground max-w-xs">
             A câmera será aberta automaticamente. Após tirar a selfie, a foto aparecerá aqui em tempo real.
           </p>
           <div className="flex items-center justify-center gap-1 text-xs text-warning">
             <RefreshCw className="w-3 h-3" />
             <span>Expira em {formatTime(countdown)}</span>
           </div>
         </div>
       )}
       
       {/* Demo Note */}
       <div className="text-xs text-center text-muted-foreground/70 bg-secondary/50 px-3 py-2 rounded-lg max-w-xs">
         <strong>Modo Demo:</strong> A simulação mostrará uma foto automaticamente em ~7 segundos.
       </div>
       
       {/* Cancel Button */}
       <Button 
         variant="outline" 
         size="sm" 
         onClick={onCancel}
         className="gap-2"
       >
         <X className="w-4 h-4" />
         Cancelar
       </Button>
     </div>
   );
 }