 import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
 import { User, UserRole } from '@/types/user';
 
 // Demo user com 50 veículos
 const DEMO_USER: User = {
   id: 'demo-user',
   name: 'Demonstração',
   email: 'demo@fleetai.com',
   role: 'manager',
   status: 'active',
   createdAt: new Date(),
 };
 
 interface AuthContextType {
   user: User | null;
   isAuthenticated: boolean;
   isDemoMode: boolean;
   login: (email: string, password: string) => Promise<boolean>;
   loginDemo: () => void;
   logout: () => void;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 interface AuthProviderProps {
   children: ReactNode;
 }
 
 export function AuthProvider({ children }: AuthProviderProps) {
   const [user, setUser] = useState<User | null>(null);
   const [isDemoMode, setIsDemoMode] = useState(false);
 
   const login = useCallback(async (email: string, password: string): Promise<boolean> => {
     // Simulação de login - em produção, conectar ao backend
     if (email && password) {
       setUser({
         id: 'user-1',
         name: 'Administrador',
         email: email,
         role: 'super_admin',
         status: 'active',
         createdAt: new Date(),
       });
       setIsDemoMode(false);
       return true;
     }
     return false;
   }, []);
 
   const loginDemo = useCallback(() => {
     setUser(DEMO_USER);
     setIsDemoMode(true);
   }, []);
 
   const logout = useCallback(() => {
     setUser(null);
     setIsDemoMode(false);
   }, []);
 
   const value: AuthContextType = {
     user,
     isAuthenticated: !!user,
     isDemoMode,
     login,
     loginDemo,
     logout,
   };
 
   return (
     <AuthContext.Provider value={value}>
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 }