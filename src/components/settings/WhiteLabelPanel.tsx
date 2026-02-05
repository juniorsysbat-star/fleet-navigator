 import { useState, useRef } from 'react';
 import { 
   Palette, 
   Upload, 
   Type, 
   RotateCcw, 
   Check,
   Image as ImageIcon,
   X
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useCustomization, ModuleNames } from '@/contexts/CustomizationContext';
 
 const PRESET_COLORS = [
   { name: 'Ciano', hex: '#00FFFF', hue: 180 },
   { name: 'Laranja', hex: '#FF8C00', hue: 35 },
   { name: 'Azul', hex: '#0080FF', hue: 210 },
   { name: 'Verde', hex: '#00FF80', hue: 150 },
   { name: 'Roxo', hex: '#A855F7', hue: 270 },
   { name: 'Rosa', hex: '#FF1493', hue: 330 },
   { name: 'Amarelo', hex: '#FFD700', hue: 50 },
   { name: 'Vermelho', hex: '#FF4444', hue: 0 },
 ];
 
 const MODULE_KEYS: { key: keyof ModuleNames; label: string; placeholder: string }[] = [
   { key: 'tracking', label: 'Rastreamento', placeholder: 'Ex: Meus Carros' },
   { key: 'analytics', label: 'IA Analytics', placeholder: 'Ex: Relatórios' },
   { key: 'billing', label: 'Financeiro', placeholder: 'Ex: Cobranças' },
   { key: 'users', label: 'Usuários', placeholder: 'Ex: Clientes' },
   { key: 'settings', label: 'Configurações', placeholder: 'Ex: Ajustes' },
 ];
 
 export const WhiteLabelPanel = () => {
   const { settings, updateLogo, updatePrimaryColor, updateModuleName, resetSettings } = useCustomization();
   const [customColor, setCustomColor] = useState(settings.primaryColor);
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
 
     // Validate file type
     if (!file.type.startsWith('image/')) {
       alert('Por favor, selecione uma imagem válida.');
       return;
     }
 
     // Validate file size (max 2MB)
     if (file.size > 2 * 1024 * 1024) {
       alert('A imagem deve ter no máximo 2MB.');
       return;
     }
 
     const reader = new FileReader();
     reader.onload = (event) => {
       const base64 = event.target?.result as string;
       updateLogo(base64);
     };
     reader.readAsDataURL(file);
   };
 
   const handleRemoveLogo = () => {
     updateLogo(null);
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const handleColorChange = (hex: string) => {
     setCustomColor(hex);
     updatePrimaryColor(hex);
   };
 
   return (
     <div className="space-y-8">
       {/* Logo Upload Section */}
       <div className="rounded-xl bg-card border border-border p-5">
         <div className="flex items-center gap-2 mb-4">
           <ImageIcon className="w-5 h-5 text-accent" />
           <h3 className="font-display font-bold text-foreground">Logo da Empresa</h3>
         </div>
 
         <div className="flex items-start gap-6">
           {/* Preview */}
           <div className="w-24 h-24 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
             {settings.logoUrl ? (
               <img 
                 src={settings.logoUrl} 
                 alt="Logo" 
                 className="w-full h-full object-contain"
               />
             ) : (
               <div className="text-center text-muted-foreground">
                 <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                 <span className="text-xs">Sem logo</span>
               </div>
             )}
           </div>
 
           <div className="flex-1 space-y-3">
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               onChange={handleLogoUpload}
               className="hidden"
             />
             <Button
               type="button"
               variant="outline"
               onClick={() => fileInputRef.current?.click()}
               className="w-full"
             >
               <Upload className="w-4 h-4 mr-2" />
               Fazer Upload
             </Button>
             {settings.logoUrl && (
               <Button
                 type="button"
                 variant="ghost"
                 onClick={handleRemoveLogo}
                 className="w-full text-destructive hover:text-destructive"
               >
                 <X className="w-4 h-4 mr-2" />
                 Remover Logo
               </Button>
             )}
             <p className="text-xs text-muted-foreground">
               Formatos: PNG, JPG, SVG. Máximo 2MB.
             </p>
           </div>
         </div>
       </div>
 
       {/* Primary Color Section */}
       <div className="rounded-xl bg-card border border-border p-5">
         <div className="flex items-center gap-2 mb-4">
           <Palette className="w-5 h-5 text-accent" />
           <h3 className="font-display font-bold text-foreground">Cor Primária (Tema)</h3>
         </div>
 
         {/* Preset Colors */}
         <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-4">
           {PRESET_COLORS.map((color) => (
             <button
               key={color.hex}
               onClick={() => handleColorChange(color.hex)}
               className={cn(
                 "relative w-full aspect-square rounded-lg border-2 transition-all",
                 settings.primaryColor === color.hex 
                   ? "border-foreground scale-110 shadow-lg" 
                   : "border-transparent hover:scale-105"
               )}
               style={{ backgroundColor: color.hex }}
               title={color.name}
             >
               {settings.primaryColor === color.hex && (
                 <Check className="absolute inset-0 m-auto w-4 h-4 text-black drop-shadow-md" />
               )}
             </button>
           ))}
         </div>
 
         {/* Custom Color Picker */}
         <div className="flex items-center gap-4">
           <Label className="text-sm text-muted-foreground">Cor personalizada:</Label>
           <div className="flex items-center gap-2">
             <input
               type="color"
               value={customColor}
               onChange={(e) => handleColorChange(e.target.value)}
               className="w-10 h-10 rounded-lg cursor-pointer border border-border"
             />
             <Input
               value={customColor.toUpperCase()}
               onChange={(e) => {
                 const val = e.target.value;
                 if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                   setCustomColor(val);
                   if (val.length === 7) {
                     updatePrimaryColor(val);
                   }
                 }
               }}
               className="w-28 font-mono text-sm"
               placeholder="#00FFFF"
             />
           </div>
         </div>
 
         {/* Live Preview */}
         <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
           <p className="text-xs text-muted-foreground mb-2">Pré-visualização:</p>
           <div className="flex items-center gap-4">
             <button 
               className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
               style={{ backgroundColor: settings.primaryColor, color: '#0A0F14' }}
             >
               Botão Exemplo
             </button>
             <span 
               className="text-sm font-semibold"
               style={{ color: settings.primaryColor }}
             >
               Texto Colorido
             </span>
             <div 
               className="w-3 h-3 rounded-full"
               style={{ 
                 backgroundColor: settings.primaryColor,
                 boxShadow: `0 0 10px ${settings.primaryColor}80`
               }}
             />
           </div>
         </div>
       </div>
 
       {/* Module Names Section */}
       <div className="rounded-xl bg-card border border-border p-5">
         <div className="flex items-center gap-2 mb-4">
           <Type className="w-5 h-5 text-accent" />
           <h3 className="font-display font-bold text-foreground">Nomes dos Módulos</h3>
         </div>
         <p className="text-sm text-muted-foreground mb-4">
           Personalize os nomes das abas do menu lateral.
         </p>
 
         <div className="grid gap-4">
           {MODULE_KEYS.map(({ key, label, placeholder }) => (
             <div key={key} className="flex items-center gap-4">
               <Label className="w-32 text-sm text-muted-foreground shrink-0">
                 {label}:
               </Label>
               <Input
                 value={settings.moduleNames[key]}
                 onChange={(e) => updateModuleName(key, e.target.value)}
                 placeholder={placeholder}
                 className="flex-1"
               />
             </div>
           ))}
         </div>
       </div>
 
       {/* Reset Button */}
       <div className="flex justify-end">
         <Button
           type="button"
           variant="outline"
           onClick={resetSettings}
           className="text-muted-foreground hover:text-destructive"
         >
           <RotateCcw className="w-4 h-4 mr-2" />
           Restaurar Padrões
         </Button>
       </div>
     </div>
   );
 };