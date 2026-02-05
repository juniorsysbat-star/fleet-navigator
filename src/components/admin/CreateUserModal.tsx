 import { useState } from 'react';
 import { X, UserPlus, Mail, Lock, Shield, Loader2, AlertTriangle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { UserRole } from '@/types/user';
 import { z } from 'zod';
 
 const userSchema = z.object({
   name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
   email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
   password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100, 'Senha muito longa'),
   role: z.enum(['super_admin', 'embarcador', 'manager', 'user']),
 });
 
 interface CreateUserModalProps {
   isOpen: boolean;
   onClose: () => void;
   onUserCreated: (user: { name: string; email: string; password: string; role: UserRole }) => void;
 }
 
 export function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [role, setRole] = useState<UserRole>('user');
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   if (!isOpen) return null;
 
   const handleSubmit = async () => {
     setErrors({});
     
     const result = userSchema.safeParse({ name, email, password, role });
     
     if (!result.success) {
       const fieldErrors: Record<string, string> = {};
       result.error.errors.forEach((err) => {
         if (err.path[0]) {
           fieldErrors[err.path[0] as string] = err.message;
         }
       });
       setErrors(fieldErrors);
       return;
     }
 
     setIsLoading(true);
     await new Promise(resolve => setTimeout(resolve, 800));
     
     onUserCreated({ name, email, password, role });
     
     setName('');
     setEmail('');
     setPassword('');
     setRole('user');
     setIsLoading(false);
     onClose();
   };
 
   const roles: { value: UserRole; label: string; description: string; color: string }[] = [
     { value: 'super_admin', label: 'Super Admin', description: 'Acesso total ao sistema', color: 'destructive' },
     { value: 'embarcador', label: 'Embarcador', description: 'Revendedor White Label', color: 'purple-500' },
     { value: 'manager', label: 'Gerente', description: 'Gestão de veículos e usuários', color: 'warning' },
     { value: 'user', label: 'Usuário', description: 'Visualização de veículos permitidos', color: 'accent' },
   ];
 
   const getColorClass = (colorName: string, type: 'border' | 'bg' | 'text') => {
     const colorMap: Record<string, Record<string, string>> = {
       destructive: { border: 'border-destructive', bg: 'bg-destructive', text: 'text-destructive' },
       'purple-500': { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-500' },
       warning: { border: 'border-warning', bg: 'bg-warning', text: 'text-warning' },
       accent: { border: 'border-accent', bg: 'bg-accent', text: 'text-accent' },
     };
     return colorMap[colorName]?.[type] || '';
   };
 
   return (
     <div className="fixed inset-0 z-[2000] flex items-center justify-center">
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
       
       <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
         <div className="flex items-center justify-between p-6 border-b border-border">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
               <UserPlus className="w-5 h-5 text-success" />
             </div>
             <div>
               <h2 className="font-display font-semibold text-lg">Novo Cliente</h2>
               <p className="text-xs text-muted-foreground">Criar conta de acesso</p>
             </div>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
             <X className="w-4 h-4" />
           </Button>
         </div>
 
         <div className="p-6 space-y-5">
           <div className="space-y-2">
             <Label className="text-sm font-medium">Nome Completo</Label>
             <Input
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Ex: João da Silva"
               className={`bg-muted border-border ${errors.name ? 'border-destructive' : ''}`}
             />
             {errors.name && (
               <p className="text-xs text-destructive flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> {errors.name}
               </p>
             )}
           </div>
 
           <div className="space-y-2">
             <Label className="text-sm font-medium flex items-center gap-2">
               <Mail className="w-4 h-4 text-muted-foreground" />
               Email
             </Label>
             <Input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="usuario@empresa.com"
               className={`bg-muted border-border ${errors.email ? 'border-destructive' : ''}`}
             />
             {errors.email && (
               <p className="text-xs text-destructive flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> {errors.email}
               </p>
             )}
           </div>
 
           <div className="space-y-2">
             <Label className="text-sm font-medium flex items-center gap-2">
               <Lock className="w-4 h-4 text-muted-foreground" />
               Senha
             </Label>
             <Input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Mínimo 6 caracteres"
               className={`bg-muted border-border ${errors.password ? 'border-destructive' : ''}`}
             />
             {errors.password && (
               <p className="text-xs text-destructive flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> {errors.password}
               </p>
             )}
           </div>
 
           <div className="space-y-3">
             <Label className="text-sm font-medium flex items-center gap-2">
               <Shield className="w-4 h-4 text-muted-foreground" />
               Perfil de Acesso
             </Label>
             <div className="grid gap-2">
               {roles.map((r) => (
                 <button
                   key={r.value}
                   type="button"
                   onClick={() => setRole(r.value)}
                   className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                     role === r.value
                       ? `${getColorClass(r.color, 'border')}/50 ${getColorClass(r.color, 'bg')}/10`
                       : 'border-border bg-muted/50 hover:bg-muted'
                   }`}
                 >
                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                     role === r.value ? getColorClass(r.color, 'border') : 'border-muted-foreground'
                   }`}>
                     {role === r.value && (
                       <div className={`w-2 h-2 rounded-full ${getColorClass(r.color, 'bg')}`} />
                     )}
                   </div>
                   <div>
                     <span className={`text-sm font-medium ${
                       role === r.value ? getColorClass(r.color, 'text') : 'text-foreground'
                     }`}>
                       {r.label}
                     </span>
                     <p className="text-xs text-muted-foreground">{r.description}</p>
                   </div>
                 </button>
               ))}
             </div>
           </div>
         </div>
 
         <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
           <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
           <Button
             onClick={handleSubmit}
             disabled={isLoading || !name || !email || !password}
             className="bg-success hover:bg-success/90 text-success-foreground gap-2"
           >
             {isLoading ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Criando...
               </>
             ) : (
               <>
                 <UserPlus className="w-4 h-4" />
                 Criar Cliente
               </>
             )}
           </Button>
         </div>
       </div>
     </div>
   );
 }