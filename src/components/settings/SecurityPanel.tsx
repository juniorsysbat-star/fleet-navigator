 import { useState, useEffect } from 'react';
 import { Shield, Key, Smartphone, Check, X, Eye, EyeOff } from 'lucide-react';
 import { Switch } from '@/components/ui/switch';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { cn } from '@/lib/utils';
 import { toast } from '@/hooks/use-toast';
 
 const STORAGE_KEY = 'fleetai-security';
 
 interface SecuritySettings {
   twoFactorEnabled: boolean;
 }
 
 export function SecurityPanel() {
   const { t, isRTL } = useLanguage();
   const [settings, setSettings] = useState<SecuritySettings>(() => {
     try {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (stored) return JSON.parse(stored);
     } catch (e) {
       console.error('Failed to load security settings:', e);
     }
     return { twoFactorEnabled: false };
   });
   const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
   const [saved, setSaved] = useState(false);
 
   useEffect(() => {
     try {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
     } catch (e) {
       console.error('Failed to save security settings:', e);
     }
   }, [settings]);
 
   const toggle2FA = () => {
     setSettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
     setSaved(true);
     setTimeout(() => setSaved(false), 2000);
     toast({
       title: settings.twoFactorEnabled ? '2FA Desativado' : '2FA Ativado',
       description: settings.twoFactorEnabled 
         ? 'Autenticação de dois fatores foi desativada.'
         : 'Autenticação de dois fatores foi ativada.',
     });
   };
 
   return (
     <div className={cn("space-y-6", isRTL && "text-right")}>
       {/* Header */}
       <div className="flex items-center gap-3">
         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
           <Shield className="w-6 h-6 text-accent" />
         </div>
         <div>
           <h2 className="font-display text-xl font-bold text-foreground">
             {t('security.title')}
           </h2>
           <p className="text-sm text-muted-foreground">
             {t('security.subtitle')}
           </p>
         </div>
         {saved && (
           <div className={cn("flex items-center gap-1 text-xs text-success animate-fade-in", isRTL ? "mr-auto" : "ml-auto")}>
             <Check className="w-4 h-4" />
             {t('settings.saved')}
           </div>
         )}
       </div>
 
       {/* Change Password */}
       <div className={cn(
         "flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all",
         isRTL && "flex-row-reverse"
       )}>
         <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
           <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
             <Key className="w-5 h-5 text-muted-foreground" />
           </div>
           <div>
             <p className="font-semibold text-foreground">{t('security.changePassword')}</p>
             <p className="text-xs text-muted-foreground">{t('security.changePassword.desc')}</p>
           </div>
         </div>
         <Button 
           variant="outline" 
           size="sm"
           onClick={() => setIsPasswordModalOpen(true)}
         >
           {t('security.changePassword')}
         </Button>
       </div>
 
       {/* 2FA Toggle */}
       <div className={cn(
         "flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all",
         isRTL && "flex-row-reverse"
       )}>
         <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
           <div className={cn(
             "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
             settings.twoFactorEnabled 
               ? "bg-accent/20 text-accent" 
               : "bg-secondary text-muted-foreground"
           )}>
             <Smartphone className="w-5 h-5" />
           </div>
           <div>
             <p className="font-semibold text-foreground">{t('security.2fa')}</p>
             <p className="text-xs text-muted-foreground">{t('security.2fa.desc')}</p>
             <p className={cn(
               "text-xs mt-1 font-medium",
               settings.twoFactorEnabled ? "text-success" : "text-muted-foreground"
             )}>
               {settings.twoFactorEnabled ? t('security.2fa.enabled') : t('security.2fa.disabled')}
             </p>
           </div>
         </div>
         <Switch
           checked={settings.twoFactorEnabled}
           onCheckedChange={toggle2FA}
           className="data-[state=checked]:bg-accent"
         />
       </div>
 
       {/* Password Modal */}
       <PasswordModal 
         isOpen={isPasswordModalOpen} 
         onClose={() => setIsPasswordModalOpen(false)} 
       />
     </div>
   );
 }
 
 function PasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
   const { t, isRTL } = useLanguage();
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPasswords, setShowPasswords] = useState(false);
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const validate = () => {
     const newErrors: Record<string, string> = {};
     if (!currentPassword) newErrors.current = 'Senha atual é obrigatória';
     if (!newPassword) newErrors.new = 'Nova senha é obrigatória';
     else if (newPassword.length < 8) newErrors.new = 'Mínimo 8 caracteres';
     if (newPassword !== confirmPassword) newErrors.confirm = 'Senhas não coincidem';
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!validate()) return;
     
     // Simulate password change
     toast({
       title: 'Senha Alterada!',
       description: 'Sua senha foi atualizada com sucesso.',
     });
     onClose();
     setCurrentPassword('');
     setNewPassword('');
     setConfirmPassword('');
   };
 
   if (!isOpen) return null;
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center">
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
       
       <div className={cn(
         "relative w-full max-w-md mx-4 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200",
         isRTL && "text-right"
       )}>
         {/* Header */}
         <div className={cn(
           "flex items-center justify-between p-4 border-b border-border",
           isRTL && "flex-row-reverse"
         )}>
           <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
               <Key className="w-5 h-5 text-accent" />
             </div>
             <div>
               <h2 className="font-display text-lg font-bold text-foreground">
                 {t('security.changePassword')}
               </h2>
             </div>
           </div>
           <button
             onClick={onClose}
             className="p-2 rounded-lg hover:bg-secondary transition-colors"
           >
             <X className="w-5 h-5 text-muted-foreground" />
           </button>
         </div>
 
         <form onSubmit={handleSubmit} className="p-4 space-y-4">
           <div className="space-y-2">
             <Label>{t('security.currentPassword')}</Label>
             <div className="relative">
               <Input
                 type={showPasswords ? 'text' : 'password'}
                 value={currentPassword}
                 onChange={(e) => setCurrentPassword(e.target.value)}
                 className={errors.current ? 'border-destructive' : ''}
               />
               <button
                 type="button"
                 onClick={() => setShowPasswords(!showPasswords)}
                 className={cn(
                   "absolute top-1/2 -translate-y-1/2 p-2",
                   isRTL ? "left-2" : "right-2"
                 )}
               >
                 {showPasswords ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
               </button>
             </div>
             {errors.current && <p className="text-xs text-destructive">{errors.current}</p>}
           </div>
 
           <div className="space-y-2">
             <Label>{t('security.newPassword')}</Label>
             <Input
               type={showPasswords ? 'text' : 'password'}
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               className={errors.new ? 'border-destructive' : ''}
             />
             {errors.new && <p className="text-xs text-destructive">{errors.new}</p>}
           </div>
 
           <div className="space-y-2">
             <Label>{t('security.confirmPassword')}</Label>
             <Input
               type={showPasswords ? 'text' : 'password'}
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               className={errors.confirm ? 'border-destructive' : ''}
             />
             {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
           </div>
 
           <div className={cn("flex gap-3 pt-4", isRTL && "flex-row-reverse")}>
             <Button type="button" variant="outline" onClick={onClose} className="flex-1">
               {t('settings.cancel')}
             </Button>
             <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90">
               {t('common.confirm')}
             </Button>
           </div>
         </form>
       </div>
     </div>
   );
 }