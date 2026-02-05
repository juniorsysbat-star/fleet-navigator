 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Navigation, Sparkles, LogIn, Eye, EyeOff } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useAuth } from '@/contexts/AuthContext';
 import { toast } from 'sonner';
 
 const Login = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const { login, loginDemo } = useAuth();
   const navigate = useNavigate();
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
 
     const success = await login(email, password);
     
     if (success) {
       toast.success('Login realizado com sucesso!');
       navigate('/');
     } else {
       toast.error('Credenciais inválidas');
     }
     
     setIsLoading(false);
   };
 
   const handleDemoAccess = () => {
     loginDemo();
     toast.success('Bem-vindo ao modo demonstração!', {
       description: '50 veículos simulados estão ativos em todo o Brasil.',
     });
     navigate('/');
   };
 
   return (
     <div className="min-h-screen bg-background flex items-center justify-center p-4">
       {/* Background Effects */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
       </div>
 
       <div className="w-full max-w-md relative z-10">
         {/* Logo */}
         <div className="text-center mb-8">
           <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30 mx-auto mb-4 relative">
             <Navigation className="w-10 h-10 text-accent" />
             <span className="absolute -top-2 -right-2 w-4 h-4">
               <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
               <span className="relative inline-flex rounded-full h-4 w-4 bg-success" />
             </span>
           </div>
           <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">
             FLEET<span className="text-accent">AI</span>
           </h1>
           <p className="text-sm text-muted-foreground mt-1">
             Sistema de Rastreamento Inteligente
           </p>
         </div>
 
         {/* Demo Button - Destaque */}
         <button
           onClick={handleDemoAccess}
           className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-accent/20 via-accent/10 to-primary/20 border-2 border-accent/50 hover:border-accent transition-all group relative overflow-hidden"
         >
           <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center justify-center gap-3 relative z-10">
             <Sparkles className="w-6 h-6 text-accent" />
             <div className="text-left">
               <p className="font-display font-bold text-foreground text-lg">
                 Acessar Demonstração Interativa
               </p>
               <p className="text-xs text-muted-foreground">
                 50 veículos simulados • Dados completos • Sem cadastro
               </p>
             </div>
           </div>
         </button>
 
         <div className="relative mb-6">
           <div className="absolute inset-0 flex items-center">
             <span className="w-full border-t border-border" />
           </div>
           <div className="relative flex justify-center text-xs uppercase">
             <span className="bg-background px-2 text-muted-foreground">ou entre com sua conta</span>
           </div>
         </div>
 
         {/* Login Form */}
         <form onSubmit={handleLogin} className="space-y-4">
           <div className="rounded-xl bg-card border border-border p-6 space-y-4">
             <div>
               <label className="block text-sm font-medium text-foreground mb-2">
                 Email
               </label>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="seu@email.com"
                 className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                 required
               />
             </div>
 
             <div>
               <label className="block text-sm font-medium text-foreground mb-2">
                 Senha
               </label>
               <div className="relative">
                 <input
                   type={showPassword ? 'text' : 'password'}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                   required
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
               </div>
             </div>
 
             <div className="flex items-center justify-between text-sm">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="rounded border-border" />
                 <span className="text-muted-foreground">Lembrar de mim</span>
               </label>
               <button type="button" className="text-accent hover:underline">
                 Esqueceu a senha?
               </button>
             </div>
 
             <Button
               type="submit"
               className="w-full gap-2"
               disabled={isLoading}
             >
               <LogIn className="w-4 h-4" />
               {isLoading ? 'Entrando...' : 'Entrar'}
             </Button>
           </div>
         </form>
 
        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
          Desenvolvido por <span className="font-semibold">DATA OMEGA TECNOLOGIA MÓVEL LTDA.</span>
         </p>
       </div>
     </div>
   );
 };
 
 export default Login;