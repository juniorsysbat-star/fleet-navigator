 import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
 import { User, UserRole } from '@/types/user';
 import { apiLogin, apiLogout, getAuthToken, setAuthToken } from '@/services/apiService';
 import { connectSocket, disconnectSocket } from '@/services/socketService';
 
 // Demo user com 50 veículos
 const DEMO_USER: User = {
   id: 'demo-user',
   name: 'Demonstração',
   email: 'demo@fleetai.com',
   role: 'manager',
   status: 'active',
   createdAt: new Date(),
 };
 
 // Chave do localStorage para persistir sessão
 const AUTH_STORAGE_KEY = 'datafleet_user';
 
 interface AuthContextType {
   user: User | null;
   isAuthenticated: boolean;
   isDemoMode: boolean;
   isApiConnected: boolean;
   login: (email: string, password: string) => Promise<boolean>;
   loginDemo: () => void;
   logout: () => void;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 interface AuthProviderProps {
   children: ReactNode;
 }
 
 export function AuthProvider({ children }: AuthProviderProps) {
   const [user, setUser] = useState<User | null>(() => {
     // Recupera usuário salvo
     try {
       const saved = localStorage.getItem(AUTH_STORAGE_KEY);
       if (saved) return JSON.parse(saved);
     } catch {
       // Ignora erro de parse
     }
     return null;
   });
   const [isDemoMode, setIsDemoMode] = useState(false);
   const [isApiConnected, setIsApiConnected] = useState(false);
 
   // Conecta socket se houver token salvo
   useEffect(() => {
     const token = getAuthToken();
     if (token && user && !isDemoMode) {
       connectSocket(token);
       setIsApiConnected(true);
     }
   }, [user, isDemoMode]);
 
   const login = useCallback(async (email: string, password: string): Promise<boolean> => {
     try {
       // Tenta login na API
       const response = await apiLogin({ email, password });
       
       if (response.success && response.user) {
         const newUser: User = {
           id: response.user.id,
           name: response.user.name,
           email: response.user.email,
           role: (response.user.role as UserRole) || 'user',
           status: 'active',
           createdAt: new Date(),
         };
         
         setUser(newUser);
         localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
         setIsDemoMode(false);
         setIsApiConnected(true);
         
         // Conecta socket com token
         if (response.token) {
           connectSocket(response.token);
         }
         
         return true;
       }
       
       // Fallback: se API não disponível, aceita login local
       if (response.message?.includes('conexão') || response.message?.includes('fetch')) {
         console.info('API offline, usando login local');
         const localUser: User = {
           id: 'local-user',
           name: email.split('@')[0],
           email: email,
           role: 'super_admin',
           status: 'active',
           createdAt: new Date(),
         };
         setUser(localUser);
         localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUser));
         setIsDemoMode(false);
         setIsApiConnected(false);
         return true;
       }
       
       return false;
     } catch (error) {
       console.error('Erro no login:', error);
       // Fallback para login local em caso de erro
       if (email && password) {
         const localUser: User = {
           id: 'local-user',
           name: email.split('@')[0],
           email: email,
           role: 'super_admin',
           status: 'active',
           createdAt: new Date(),
         };
         setUser(localUser);
         localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUser));
         setIsDemoMode(false);
         return true;
       }
       return false;
     }
   }, []);
 
   const loginDemo = useCallback(() => {
     setUser(DEMO_USER);
     localStorage.removeItem(AUTH_STORAGE_KEY);
     setIsDemoMode(true);
     setIsApiConnected(false);
     disconnectSocket();
   }, []);
 
   const logout = useCallback(() => {
     setUser(null);
     localStorage.removeItem(AUTH_STORAGE_KEY);
     setIsDemoMode(false);
     setIsApiConnected(false);
     apiLogout();
     disconnectSocket();
   }, []);
 
   const value: AuthContextType = {
     user,
     isAuthenticated: !!user,
     isDemoMode,
     isApiConnected,
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