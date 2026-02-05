 import { useState, useEffect } from 'react';
 import { Bell, Zap, Gauge, MapPin, Wrench, Check } from 'lucide-react';
 import { Switch } from '@/components/ui/switch';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { cn } from '@/lib/utils';
 
 const STORAGE_KEY = 'fleetai-notifications';
 
 interface NotificationSettings {
   ignition: boolean;
   speed: boolean;
   geofence: boolean;
   maintenance: boolean;
 }
 
 const DEFAULT_SETTINGS: NotificationSettings = {
   ignition: true,
   speed: true,
   geofence: false,
   maintenance: false,
 };
 
 export function NotificationsPanel() {
   const { t, isRTL } = useLanguage();
   const [settings, setSettings] = useState<NotificationSettings>(() => {
     try {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (stored) return JSON.parse(stored);
     } catch (e) {
       console.error('Failed to load notification settings:', e);
     }
     return DEFAULT_SETTINGS;
   });
   const [saved, setSaved] = useState(false);
 
   useEffect(() => {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
       setSaved(true);
       const timer = setTimeout(() => setSaved(false), 2000);
       return () => clearTimeout(timer);
     } catch (e) {
       console.error('Failed to save notification settings:', e);
     }
   }, [settings]);
 
   const toggleSetting = (key: keyof NotificationSettings) => {
     setSettings(prev => ({ ...prev, [key]: !prev[key] }));
   };
 
   const notificationItems = [
     { key: 'ignition' as const, icon: Zap, titleKey: 'notifications.ignition' as const, descKey: 'notifications.ignition.desc' as const },
     { key: 'speed' as const, icon: Gauge, titleKey: 'notifications.speed' as const, descKey: 'notifications.speed.desc' as const },
     { key: 'geofence' as const, icon: MapPin, titleKey: 'notifications.geofence' as const, descKey: 'notifications.geofence.desc' as const },
     { key: 'maintenance' as const, icon: Wrench, titleKey: 'notifications.maintenance' as const, descKey: 'notifications.maintenance.desc' as const },
   ];
 
   return (
     <div className={cn("space-y-6", isRTL && "text-right")}>
       {/* Header */}
       <div className="flex items-center gap-3">
         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
           <Bell className="w-6 h-6 text-accent" />
         </div>
         <div>
           <h2 className="font-display text-xl font-bold text-foreground">
             {t('notifications.title')}
           </h2>
           <p className="text-sm text-muted-foreground">
             {t('notifications.subtitle')}
           </p>
         </div>
         {saved && (
           <div className={cn("flex items-center gap-1 text-xs text-success animate-fade-in", isRTL ? "mr-auto" : "ml-auto")}>
             <Check className="w-4 h-4" />
             {t('settings.saved')}
           </div>
         )}
       </div>
 
       {/* Notification Toggles */}
       <div className="space-y-3">
         {notificationItems.map(({ key, icon: Icon, titleKey, descKey }) => (
           <div
             key={key}
             className={cn(
               "flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all",
               isRTL && "flex-row-reverse"
             )}
           >
             <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
               <div className={cn(
                 "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                 settings[key] 
                   ? "bg-accent/20 text-accent" 
                   : "bg-secondary text-muted-foreground"
               )}>
                 <Icon className="w-5 h-5" />
               </div>
               <div>
                 <p className="font-semibold text-foreground">{t(titleKey)}</p>
                 <p className="text-xs text-muted-foreground">{t(descKey)}</p>
               </div>
             </div>
             <Switch
               checked={settings[key]}
               onCheckedChange={() => toggleSetting(key)}
               className="data-[state=checked]:bg-accent"
             />
           </div>
         ))}
       </div>
     </div>
   );
 }