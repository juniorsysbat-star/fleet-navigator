 import { useState, useEffect } from 'react';
 import { Globe, Check, Languages } from 'lucide-react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { LANGUAGES, Language } from '@/i18n/translations';
 import { cn } from '@/lib/utils';
 
 export function LocalePanel() {
   const { t, language, setLanguage, isRTL } = useLanguage();
   const [saved, setSaved] = useState(false);
 
   const handleLanguageChange = (lang: Language) => {
     setLanguage(lang);
     setSaved(true);
     setTimeout(() => setSaved(false), 2000);
   };
 
   return (
     <div className={cn("space-y-6", isRTL && "text-right")}>
       {/* Header */}
       <div className="flex items-center gap-3">
         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
           <Globe className="w-6 h-6 text-accent" />
         </div>
         <div>
           <h2 className="font-display text-xl font-bold text-foreground">
             {t('locale.title')}
           </h2>
           <p className="text-sm text-muted-foreground">
             {t('locale.subtitle')}
           </p>
         </div>
         {saved && (
           <div className={cn("flex items-center gap-1 text-xs text-success animate-fade-in", isRTL ? "mr-auto" : "ml-auto")}>
             <Check className="w-4 h-4" />
             {t('settings.saved')}
           </div>
         )}
       </div>
 
       {/* Language Selector */}
       <div className="space-y-3">
         <label className="flex items-center gap-2 text-sm font-medium text-foreground">
           <Languages className="w-4 h-4" />
           {t('locale.language')}
         </label>
         
         <div className="grid grid-cols-1 gap-2">
           {LANGUAGES.map((lang) => (
             <button
               key={lang.code}
               onClick={() => handleLanguageChange(lang.code)}
               className={cn(
                 "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                 "hover:bg-accent/10 hover:border-accent/50",
                 language === lang.code
                   ? "bg-accent/20 border-accent shadow-[0_0_15px_hsl(var(--accent)/0.3)]"
                   : "bg-card border-border/50",
                 isRTL && "flex-row-reverse"
               )}
             >
               <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                 <div className={cn(
                   "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
                   language === lang.code 
                     ? "bg-accent/30 text-accent" 
                     : "bg-secondary text-muted-foreground"
                 )}>
                   {lang.code === 'pt-BR' && '🇧🇷'}
                   {lang.code === 'en' && '🇺🇸'}
                   {lang.code === 'es' && '🇪🇸'}
                   {lang.code === 'zh' && '🇨🇳'}
                   {lang.code === 'ar' && '🇸🇦'}
                 </div>
                 <div className={cn(isRTL && "text-right")}>
                   <p className={cn(
                     "font-semibold",
                     language === lang.code ? "text-accent" : "text-foreground"
                   )}>
                     {lang.nativeName}
                   </p>
                   <p className="text-xs text-muted-foreground">{lang.name}</p>
                 </div>
               </div>
               
               {language === lang.code && (
                 <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                   <Check className="w-4 h-4 text-accent-foreground" />
                 </div>
               )}
               
               {lang.rtl && (
                 <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                   RTL
                 </span>
               )}
             </button>
           ))}
         </div>
       </div>
 
       {/* RTL Notice */}
       {isRTL && (
         <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
           <p className="text-sm text-accent">
             ✓ Layout RTL (Right-to-Left) ativado para árabe
           </p>
         </div>
       )}
     </div>
   );
 }