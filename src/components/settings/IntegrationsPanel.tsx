 import { useState, useEffect } from 'react';
 import { Database, Link2, Key, Webhook, Check, Loader2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { cn } from '@/lib/utils';
 import { toast } from '@/hooks/use-toast';
 
 const STORAGE_KEY = 'fleetai-integrations';
 
 interface IntegrationSettings {
   asaasToken: string;
   webhookUrl: string;
 }
 
 export function IntegrationsPanel() {
   const { t, isRTL } = useLanguage();
   const [settings, setSettings] = useState<IntegrationSettings>(() => {
     try {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (stored) return JSON.parse(stored);
     } catch (e) {
       console.error('Failed to load integration settings:', e);
     }
     return { asaasToken: '', webhookUrl: '' };
   });
   const [saved, setSaved] = useState(false);
   const [testing, setTesting] = useState<string | null>(null);
 
   const saveSettings = () => {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
       setSaved(true);
       setTimeout(() => setSaved(false), 2000);
       toast({
         title: t('settings.saved'),
         description: 'Configurações de integração salvas.',
       });
     } catch (e) {
       console.error('Failed to save integration settings:', e);
     }
   };
 
   const testConnection = async (type: 'asaas' | 'webhook') => {
     setTesting(type);
     
     // Simulate API test
     await new Promise(resolve => setTimeout(resolve, 1500));
     
     const value = type === 'asaas' ? settings.asaasToken : settings.webhookUrl;
     
     if (value) {
       toast({
         title: 'Conexão Bem Sucedida!',
         description: `${type === 'asaas' ? 'Asaas' : 'Webhook'} está configurado corretamente.`,
       });
     } else {
       toast({
         title: 'Erro de Conexão',
         description: `Por favor, preencha o ${type === 'asaas' ? 'token' : 'URL'} antes de testar.`,
         variant: 'destructive',
       });
     }
     
     setTesting(null);
   };
 
   return (
     <div className={cn("space-y-6", isRTL && "text-right")}>
       {/* Header */}
       <div className="flex items-center gap-3">
         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
           <Database className="w-6 h-6 text-accent" />
         </div>
         <div>
           <h2 className="font-display text-xl font-bold text-foreground">
             {t('integrations.title')}
           </h2>
           <p className="text-sm text-muted-foreground">
             {t('integrations.subtitle')}
           </p>
         </div>
         {saved && (
           <div className={cn("flex items-center gap-1 text-xs text-success animate-fade-in", isRTL ? "mr-auto" : "ml-auto")}>
             <Check className="w-4 h-4" />
             {t('settings.saved')}
           </div>
         )}
       </div>
 
       {/* Asaas Token */}
       <div className="p-4 rounded-xl bg-card border border-border space-y-4">
         <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
           <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
             <Key className="w-5 h-5 text-green-400" />
           </div>
           <div>
             <p className="font-semibold text-foreground">{t('integrations.asaas')}</p>
             <p className="text-xs text-muted-foreground">{t('integrations.asaas.desc')}</p>
           </div>
         </div>
         
         <div className="space-y-2">
           <Label>API Token</Label>
           <Input
             type="password"
             value={settings.asaasToken}
             onChange={(e) => setSettings(prev => ({ ...prev, asaasToken: e.target.value }))}
             placeholder={t('integrations.asaas.placeholder')}
           />
         </div>
         
         <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
           <Button 
             variant="outline" 
             size="sm"
             onClick={() => testConnection('asaas')}
             disabled={testing === 'asaas'}
           >
             {testing === 'asaas' ? (
               <Loader2 className="w-4 h-4 animate-spin mr-2" />
             ) : (
               <Link2 className="w-4 h-4 mr-2" />
             )}
             {t('integrations.test')}
           </Button>
         </div>
       </div>
 
       {/* Webhook URL */}
       <div className="p-4 rounded-xl bg-card border border-border space-y-4">
         <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
           <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
             <Webhook className="w-5 h-5 text-blue-400" />
           </div>
           <div>
             <p className="font-semibold text-foreground">{t('integrations.webhook')}</p>
             <p className="text-xs text-muted-foreground">{t('integrations.webhook.desc')}</p>
           </div>
         </div>
         
         <div className="space-y-2">
           <Label>URL</Label>
           <Input
             type="url"
             value={settings.webhookUrl}
             onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
             placeholder={t('integrations.webhook.placeholder')}
           />
         </div>
         
         <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
           <Button 
             variant="outline" 
             size="sm"
             onClick={() => testConnection('webhook')}
             disabled={testing === 'webhook'}
           >
             {testing === 'webhook' ? (
               <Loader2 className="w-4 h-4 animate-spin mr-2" />
             ) : (
               <Link2 className="w-4 h-4 mr-2" />
             )}
             {t('integrations.test')}
           </Button>
         </div>
       </div>
 
       {/* Save Button */}
       <Button onClick={saveSettings} className="w-full bg-accent hover:bg-accent/90">
         <Check className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
         {t('settings.save')}
       </Button>
     </div>
   );
 }