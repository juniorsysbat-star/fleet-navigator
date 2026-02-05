 import { NavLink, useLocation, useNavigate } from 'react-router-dom';
 import { 
   Map, 
   Brain, 
   CreditCard, 
   Settings, 
   Navigation,
   ChevronLeft,
   ChevronRight,
   Users,
   Plus,
   LogOut,
   Building2,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { useState } from 'react';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
 import { useCustomization } from '@/contexts/CustomizationContext';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { DeviceModal, DeviceFormData } from '@/components/admin/DeviceModal';
 import { toast } from '@/hooks/use-toast';
 
 export function AppSidebar() {
   const [isCollapsed, setIsCollapsed] = useState(false);
   const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();
   const { settings } = useCustomization();
   const { t, isRTL } = useLanguage();
   const { user, logout, isDemoMode } = useAuth();
 
   const navItems = [
     { path: '/', icon: Map, label: settings.moduleNames.tracking || t('nav.tracking') },
     { path: '/analytics', icon: Brain, label: settings.moduleNames.analytics || t('nav.analytics') },
     { path: '/billing', icon: CreditCard, label: settings.moduleNames.billing || t('nav.billing') },
     { path: '/admin/users', icon: Users, label: settings.moduleNames.users || t('nav.users') },
     { path: '/settings', icon: Settings, label: settings.moduleNames.settings || t('nav.settings') },
   ];
 
   // Menu exclusivo para Super Admin
   const adminOnlyItems = user?.role === 'super_admin' ? [
     { path: '/reseller-billing', icon: Building2, label: 'Financeiro Revenda' },
   ] : [];
 
   const allNavItems = [...navItems, ...adminOnlyItems];
 
   const handleAddDevice = (device: DeviceFormData) => {
     console.log('New device:', device);
     toast({
       title: 'Dispositivo Adicionado!',
       description: `${device.name} (IMEI: ${device.imei}) foi cadastrado com sucesso.`,
     });
   };
 
   const handleLogout = () => {
     logout();
     navigate('/login');
   };
 
   return (
     <>
       <aside 
         className={cn(
           "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
           isCollapsed ? "w-[72px]" : "w-[200px]",
           isRTL && "border-r-0 border-l"
         )}
       >
         {/* Logo */}
         <div className="p-4 border-b border-sidebar-border">
           <div className="flex items-center gap-3">
             {settings.logoUrl ? (
               <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-accent/40">
                 <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               </div>
             ) : (
               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center border border-accent/40 shrink-0 relative">
                 <Navigation className="w-5 h-5 text-accent" />
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5">
                   <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                 </span>
               </div>
             )}
             {!isCollapsed && (
               <div className="animate-fade-in">
                 <h1 className="font-display font-bold text-sm text-foreground tracking-wider">
                   FLEET<span className="text-accent">AI</span>
                 </h1>
                 <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                   Pro Platform
                 </p>
               </div>
             )}
           </div>
         </div>
 
         {/* Add Device Button */}
         <div className="p-3 border-b border-sidebar-border">
           {isCollapsed ? (
             <Tooltip delayDuration={0}>
               <TooltipTrigger asChild>
                 <button
                   onClick={() => setIsDeviceModalOpen(true)}
                   className="w-full flex items-center justify-center p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </TooltipTrigger>
               <TooltipContent side="right">
                 <span className="font-semibold">Novo Dispositivo</span>
               </TooltipContent>
             </Tooltip>
           ) : (
             <button
               onClick={() => setIsDeviceModalOpen(true)}
               className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all font-semibold text-sm"
             >
               <Plus className="w-4 h-4" />
               <span>{t('nav.newDevice')}</span>
             </button>
           )}
         </div>
 
         {/* Navigation */}
         <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
           {allNavItems.map((item) => {
             const isActive = location.pathname === item.path;
             const Icon = item.icon;
 
             const linkContent = (
               <NavLink
                 to={item.path}
                 className={cn(
                   "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                   isActive
                     ? "bg-accent/10 text-accent border border-accent/30"
                     : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent",
                   isRTL && "flex-row-reverse"
                 )}
               >
                 {isActive && (
                   <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none" />
                 )}
                 
                 <Icon 
                   className={cn(
                     "w-5 h-5 shrink-0 transition-all duration-200 relative z-10",
                     isActive && "drop-shadow-[0_0_8px_hsl(var(--accent))]"
                   )} 
                 />
                 
                 {!isCollapsed && (
                   <span className={cn(
                     "text-sm font-semibold animate-fade-in relative z-10",
                     isActive && "text-accent"
                   )}>
                     {item.label}
                   </span>
                 )}
 
                 {isActive && (
                   <div className={cn(
                     "absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-accent shadow-[0_0_10px_hsl(var(--accent))]",
                     isRTL ? "left-0 rounded-r-full" : "right-0 rounded-l-full"
                   )} />
                 )}
               </NavLink>
             );
 
             if (isCollapsed) {
               return (
                 <Tooltip key={item.path} delayDuration={0}>
                   <TooltipTrigger asChild>
                     {linkContent}
                   </TooltipTrigger>
                   <TooltipContent side={isRTL ? "left" : "right"} className="flex flex-col">
                     <span className="font-semibold">{item.label}</span>
                   </TooltipContent>
                 </Tooltip>
               );
             }
 
             return <div key={item.path}>{linkContent}</div>;
           })}
         </nav>
 
         {/* Footer */}
         <div className="p-3 border-t border-sidebar-border">
           {isDemoMode && !isCollapsed && (
             <div className="mb-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30">
               <p className="text-[10px] font-bold text-accent uppercase tracking-wide text-center">
                 Modo Demonstração
               </p>
             </div>
           )}
 
           {user && (
             isCollapsed ? (
               <Tooltip delayDuration={0}>
                 <TooltipTrigger asChild>
                   <button
                     onClick={handleLogout}
                     className="w-full flex items-center justify-center p-3 mb-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                   >
                     <LogOut className="w-5 h-5" />
                   </button>
                 </TooltipTrigger>
                 <TooltipContent side="right">
                   <span className="font-semibold">Sair</span>
                 </TooltipContent>
               </Tooltip>
             ) : (
               <button
                 onClick={handleLogout}
                 className="w-full flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all text-sm font-medium"
               >
                 <LogOut className="w-4 h-4" />
                 <span>Sair</span>
               </button>
             )
           )}
 
           <button
             onClick={() => setIsCollapsed(!isCollapsed)}
             className={cn(
               "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
               "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent hover:border-border",
               isRTL && "flex-row-reverse"
             )}
           >
             {isCollapsed ? (
               <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
             ) : (
               <>
                 <ChevronLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
                 <span className="text-xs font-medium">{t('nav.collapse')}</span>
               </>
             )}
           </button>
         </div>
       </aside>
 
       <DeviceModal
         isOpen={isDeviceModalOpen}
         onClose={() => setIsDeviceModalOpen(false)}
         onSave={handleAddDevice}
       />
     </>
   );
 }