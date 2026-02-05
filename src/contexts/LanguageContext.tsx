 import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 import { translations, Language, TranslationKey, LANGUAGES } from '@/i18n/translations';
 
 const STORAGE_KEY = 'fleetai-language';
 
 interface LanguageContextType {
   language: Language;
   setLanguage: (lang: Language) => void;
   t: (key: TranslationKey) => string;
   isRTL: boolean;
 }
 
 const LanguageContext = createContext<LanguageContextType | null>(null);
 
 export const LanguageProvider = ({ children }: { children: ReactNode }) => {
   const [language, setLanguageState] = useState<Language>(() => {
     try {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (stored && Object.keys(translations).includes(stored)) {
         return stored as Language;
       }
     } catch (e) {
       console.error('Failed to load language setting:', e);
     }
     return 'pt-BR';
   });
 
   const isRTL = LANGUAGES.find(l => l.code === language)?.rtl || false;
 
   // Apply RTL direction to document
   useEffect(() => {
     document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
     document.documentElement.lang = language;
   }, [language, isRTL]);
 
   // Persist to localStorage
   useEffect(() => {
     try {
       localStorage.setItem(STORAGE_KEY, language);
     } catch (e) {
       console.error('Failed to save language setting:', e);
     }
   }, [language]);
 
   const setLanguage = (lang: Language) => {
     setLanguageState(lang);
   };
 
   const t = (key: TranslationKey): string => {
     const dict = translations[language];
     return dict[key] || translations['pt-BR'][key] || key;
   };
 
   return (
     <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
       {children}
     </LanguageContext.Provider>
   );
 };
 
 export const useLanguage = () => {
   const context = useContext(LanguageContext);
   if (!context) {
     throw new Error('useLanguage must be used within a LanguageProvider');
   }
   return context;
 };