 import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 
 export interface ModuleNames {
   tracking: string;
   analytics: string;
   billing: string;
   users: string;
   settings: string;
 }
 
 export interface CustomizationSettings {
   logoUrl: string | null;
   primaryColor: string;
   accentHue: number;
   moduleNames: ModuleNames;
 }
 
 const DEFAULT_SETTINGS: CustomizationSettings = {
   logoUrl: null,
   primaryColor: '#00FFFF', // Cyan
   accentHue: 180,
   moduleNames: {
     tracking: 'Rastreamento',
     analytics: 'IA Analytics',
     billing: 'Financeiro',
     users: 'Usuários',
     settings: 'Configurações',
   },
 };
 
 const STORAGE_KEY = 'fleetai-customization';
 
 interface CustomizationContextType {
   settings: CustomizationSettings;
   updateLogo: (url: string | null) => void;
   updatePrimaryColor: (color: string) => void;
   updateModuleName: (module: keyof ModuleNames, name: string) => void;
   resetSettings: () => void;
 }
 
 const CustomizationContext = createContext<CustomizationContextType | null>(null);
 
 // Convert hex to HSL hue
 const hexToHue = (hex: string): number => {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   if (!result) return 180;
   
   const r = parseInt(result[1], 16) / 255;
   const g = parseInt(result[2], 16) / 255;
   const b = parseInt(result[3], 16) / 255;
   
   const max = Math.max(r, g, b);
   const min = Math.min(r, g, b);
   let h = 0;
   
   if (max !== min) {
     const d = max - min;
     switch (max) {
       case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
       case g: h = ((b - r) / d + 2) / 6; break;
       case b: h = ((r - g) / d + 4) / 6; break;
     }
   }
   
   return Math.round(h * 360);
 };
 
 // Apply CSS custom properties based on hue
 const applyThemeColors = (hue: number) => {
   const root = document.documentElement;
   
   // Update accent color (main theme color)
   root.style.setProperty('--accent', `${hue} 100% 50%`);
   root.style.setProperty('--accent-foreground', '220 20% 6%');
   
   // Update primary color
   root.style.setProperty('--primary', `${hue} 100% 50%`);
   root.style.setProperty('--primary-foreground', '220 20% 6%');
   
   // Update success to match or complement
   root.style.setProperty('--success', `${(hue + 40) % 360} 100% 45%`);
   
   // Update ring color
   root.style.setProperty('--ring', `${hue} 100% 50%`);
   
   // Update sidebar primary
   root.style.setProperty('--sidebar-primary', `${hue} 100% 50%`);
   root.style.setProperty('--sidebar-ring', `${hue} 100% 50%`);
   
   // Update neon colors
   root.style.setProperty('--neon-cyan', `${hue} 100% 50%`);
   root.style.setProperty('--neon-green', `${(hue + 40) % 360} 100% 50%`);
   
   // Update glow effects
   root.style.setProperty('--glow-cyan', `0 0 20px hsl(${hue} 100% 50% / 0.5), 0 0 40px hsl(${hue} 100% 50% / 0.3)`);
   root.style.setProperty('--glow-green', `0 0 20px hsl(${(hue + 40) % 360} 100% 50% / 0.5), 0 0 40px hsl(${(hue + 40) % 360} 100% 50% / 0.3)`);
   
   // Status colors
   root.style.setProperty('--status-moving', `${(hue + 40) % 360} 100% 50%`);
 };
 
 export const CustomizationProvider = ({ children }: { children: ReactNode }) => {
   const [settings, setSettings] = useState<CustomizationSettings>(() => {
     try {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (stored) {
         const parsed = JSON.parse(stored);
         return { ...DEFAULT_SETTINGS, ...parsed };
       }
     } catch (e) {
       console.error('Failed to load customization settings:', e);
     }
     return DEFAULT_SETTINGS;
   });
 
   // Apply theme on mount and when settings change
   useEffect(() => {
     applyThemeColors(settings.accentHue);
   }, [settings.accentHue]);
 
   // Persist to localStorage
   useEffect(() => {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
     } catch (e) {
       console.error('Failed to save customization settings:', e);
     }
   }, [settings]);
 
   const updateLogo = (url: string | null) => {
     setSettings(prev => ({ ...prev, logoUrl: url }));
   };
 
   const updatePrimaryColor = (color: string) => {
     const hue = hexToHue(color);
     setSettings(prev => ({ ...prev, primaryColor: color, accentHue: hue }));
   };
 
   const updateModuleName = (module: keyof ModuleNames, name: string) => {
     setSettings(prev => ({
       ...prev,
       moduleNames: { ...prev.moduleNames, [module]: name },
     }));
   };
 
   const resetSettings = () => {
     setSettings(DEFAULT_SETTINGS);
     applyThemeColors(DEFAULT_SETTINGS.accentHue);
   };
 
   return (
     <CustomizationContext.Provider
       value={{
         settings,
         updateLogo,
         updatePrimaryColor,
         updateModuleName,
         resetSettings,
       }}
     >
       {children}
     </CustomizationContext.Provider>
   );
 };
 
 export const useCustomization = () => {
   const context = useContext(CustomizationContext);
   if (!context) {
     throw new Error('useCustomization must be used within a CustomizationProvider');
   }
   return context;
 };