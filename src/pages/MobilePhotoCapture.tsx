 import { useState, useRef, useEffect } from 'react';
 import { useParams } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Camera, Check, RefreshCw, Smartphone } from 'lucide-react';
 
 export default function MobilePhotoCapture() {
   const { sessionId } = useParams();
   const [status, setStatus] = useState<'ready' | 'capturing' | 'preview' | 'sent'>('ready');
   const [photoUrl, setPhotoUrl] = useState<string | null>(null);
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const streamRef = useRef<MediaStream | null>(null);
 
   // Start camera on mount
   useEffect(() => {
     startCamera();
     return () => {
       if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
       }
     };
   }, []);
 
   const startCamera = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({
         video: { facingMode: 'user', width: 480, height: 480 }
       });
       streamRef.current = stream;
       if (videoRef.current) {
         videoRef.current.srcObject = stream;
       }
       setStatus('capturing');
     } catch (error) {
       console.error('Camera error:', error);
       // Fallback for demo
       setStatus('capturing');
     }
   };
 
   const capturePhoto = () => {
     if (canvasRef.current && videoRef.current) {
       const ctx = canvasRef.current.getContext('2d');
       if (ctx) {
         canvasRef.current.width = 480;
         canvasRef.current.height = 480;
         ctx.drawImage(videoRef.current, 0, 0, 480, 480);
         const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
         setPhotoUrl(dataUrl);
         setStatus('preview');
       }
     } else {
       // Demo fallback
       setPhotoUrl('https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face');
       setStatus('preview');
     }
   };
 
   const retake = () => {
     setPhotoUrl(null);
     setStatus('capturing');
   };
 
   const sendPhoto = () => {
     // Em produção, enviaria via WebSocket para o computador do gestor
     setStatus('sent');
   };
 
   return (
     <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-sm space-y-6">
         {/* Header */}
         <div className="text-center space-y-2">
           <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
             <Smartphone className="w-6 h-6 text-accent" />
           </div>
           <h1 className="text-xl font-bold text-foreground">Captura de Foto</h1>
           <p className="text-sm text-muted-foreground">
             Sessão: {sessionId?.slice(0, 8)}...
           </p>
         </div>
 
         {/* Camera/Preview Area */}
         <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden border-2 border-border">
           {status === 'capturing' && (
             <>
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-48 h-48 border-2 border-white/50 rounded-full" />
               </div>
             </>
           )}
           
           {status === 'preview' && photoUrl && (
             <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
           )}
           
           {status === 'sent' && (
             <div className="w-full h-full flex flex-col items-center justify-center bg-success/10">
               <Check className="w-16 h-16 text-success mb-4" />
               <p className="text-success font-semibold">Foto Enviada!</p>
               <p className="text-sm text-muted-foreground mt-2">
                 Pode fechar esta página.
               </p>
             </div>
           )}
         </div>
 
         <canvas ref={canvasRef} className="hidden" />
 
         {/* Action Buttons */}
         <div className="flex gap-3">
           {status === 'capturing' && (
             <Button 
               onClick={capturePhoto}
               className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12"
             >
               <Camera className="w-5 h-5" />
               Tirar Foto
             </Button>
           )}
           
           {status === 'preview' && (
             <>
               <Button 
                 variant="outline"
                 onClick={retake}
                 className="flex-1 gap-2 h-12"
               >
                 <RefreshCw className="w-5 h-5" />
                 Tirar Outra
               </Button>
               <Button 
                 onClick={sendPhoto}
                 className="flex-1 bg-success text-success-foreground hover:bg-success/90 gap-2 h-12"
               >
                 <Check className="w-5 h-5" />
                 Enviar
               </Button>
             </>
           )}
         </div>
 
         {/* Instructions */}
         {status !== 'sent' && (
           <p className="text-xs text-center text-muted-foreground">
             Posicione o rosto dentro do círculo e clique em "Tirar Foto"
           </p>
         )}
       </div>
     </div>
   );
 }