 import { cn } from '@/lib/utils';
 
 interface MercosulPlateProps {
   plate: string;
   className?: string;
 }
 
 export const MercosulPlate = ({ plate, className }: MercosulPlateProps) => {
   const formattedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
   
   // Validate plate format
   const isValidOld = /^[A-Z]{3}\d{4}$/.test(formattedPlate);
   const isValidMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/.test(formattedPlate);
   const isValid = isValidOld || isValidMercosul;
   const isPartial = formattedPlate.length > 0 && formattedPlate.length < 7;
   
   // Format display: ABC1D23 or ABC-1234
   const displayPlate = formattedPlate.length >= 3 
     ? formattedPlate.slice(0, 3) + (formattedPlate.length > 3 ? formattedPlate.slice(3) : '')
     : formattedPlate;
 
   return (
     <div className={cn("flex flex-col items-center gap-2", className)}>
       {/* Plate Container */}
       <div 
         className={cn(
           "relative w-[280px] h-[80px] rounded-md overflow-hidden transition-all duration-300",
           "shadow-lg border-2",
           isValid 
             ? "border-green-500 shadow-green-500/30" 
             : isPartial 
               ? "border-amber-500 shadow-amber-500/20"
               : "border-border shadow-muted/20"
         )}
         style={{
           background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
         }}
       >
         {/* Blue Header Bar - BRASIL */}
         <div 
           className="absolute top-0 left-0 right-0 h-[22px] flex items-center justify-between px-2"
           style={{
             background: 'linear-gradient(180deg, #003087 0%, #002366 100%)',
           }}
         >
           {/* QR Code placeholder (left) */}
           <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center">
             <div className="w-3 h-3 grid grid-cols-3 gap-px">
               {[...Array(9)].map((_, i) => (
                 <div key={i} className={cn(
                   "w-full h-full",
                   [0, 2, 4, 6, 8].includes(i) ? "bg-white/60" : "bg-transparent"
                 )} />
               ))}
             </div>
           </div>
           
           {/* BRASIL Text */}
           <span 
             className="text-[11px] font-bold tracking-[0.2em] text-white"
             style={{ fontFamily: 'Arial, sans-serif' }}
           >
             BRASIL
           </span>
           
           {/* Brazilian Flag */}
           <div className="w-6 h-4 rounded-sm overflow-hidden flex items-center justify-center relative">
             {/* Green background */}
             <div className="absolute inset-0 bg-[#009739]" />
             {/* Yellow diamond */}
             <div 
               className="absolute w-5 h-3"
               style={{
                 background: '#FEDD00',
                 clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
               }}
             />
             {/* Blue circle */}
             <div className="absolute w-2 h-2 rounded-full bg-[#002776]" />
           </div>
         </div>
         
         {/* Plate Letters/Numbers */}
         <div className="absolute bottom-0 left-0 right-0 top-[22px] flex items-center justify-center">
           <span 
             className={cn(
               "text-[36px] font-bold tracking-[0.15em] transition-all duration-200",
               displayPlate ? "text-[#1a1a1a]" : "text-gray-300"
             )}
             style={{ 
               fontFamily: "'FE-Schrift', 'Helvetica Neue', Arial, sans-serif",
               letterSpacing: '0.12em',
               textShadow: displayPlate ? '0 1px 1px rgba(0,0,0,0.1)' : 'none',
             }}
           >
             {displayPlate || 'ABC1D23'}
           </span>
         </div>
         
         {/* Mercosul Star (left bottom corner) */}
         <div className="absolute bottom-2 left-3 flex items-center gap-1">
           <div className="w-3 h-3 text-[#003087]">
             <svg viewBox="0 0 24 24" fill="currentColor">
               <polygon points="12,2 15,9 22,9 17,14 19,22 12,17 5,22 7,14 2,9 9,9" />
             </svg>
           </div>
         </div>
         
         {/* Mercosul Logo indicator (right bottom corner) */}
         <div className="absolute bottom-2 right-3">
           <span className="text-[8px] font-semibold text-[#003087]/60 tracking-wider">
             MERCOSUL
           </span>
         </div>
       </div>
       
       {/* Validation Message */}
       <div className="h-5 flex items-center">
         {isValid && (
           <span className="text-xs text-green-500 flex items-center gap-1">
             <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <polyline points="20 6 9 17 4 12" />
             </svg>
             Placa {isValidMercosul ? 'Mercosul' : 'formato antigo'} válida
           </span>
         )}
         {isPartial && !isValid && (
           <span className="text-xs text-amber-500">
             Digite a placa completa ({7 - formattedPlate.length} caracteres restantes)
           </span>
         )}
       </div>
     </div>
   );
 };
 
 export const validatePlate = (plate: string): boolean => {
   const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
   const isValidOld = /^[A-Z]{3}\d{4}$/.test(clean);
   const isValidMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/.test(clean);
   return isValidOld || isValidMercosul;
 };