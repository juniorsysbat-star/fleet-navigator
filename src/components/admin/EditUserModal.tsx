 import { useState, useEffect } from 'react';
 import { X, Save, User as UserIcon, Mail, Shield, Calendar, Loader2, AlertTriangle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { User, UserRole } from '@/types/user';
 import { z } from 'zod';
 import { format } from 'date-fns';
 import { Calendar as CalendarComponent } from '@/components/ui/calendar';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { cn } from '@/lib/utils';
 
 const editUserSchema = z.object({
   name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
   email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
   role: z.enum(['admin', 'manager', 'user']),
   status: z.enum(['active', 'inactive', 'pending']),
 });
 
 interface EditUserModalProps {
   isOpen: boolean;
   onClose: () => void;
   user: User | null;
   onUserUpdated: (user: User) => void;
 }
 
 export function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [role, setRole] = useState<UserRole>('user');
   const [status, setStatus] = useState<'active' | 'inactive' | 'pending'>('active');
   const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   // Populate form when user changes
   useEffect(() => {
     if (user) {
       setName(user.name);
       setEmail(user.email);
       setRole(user.role);
       setStatus(user.status);
       setExpirationDate(user.expirationDate);
       setErrors({});
     }
   }, [user]);
 
   if (!isOpen || !user) return null;
 
   const handleSubmit = async () => {
     setErrors({});
     
     const result = editUserSchema.safeParse({ name, email, role, status });
     
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
     
     // Simulate API call
     await new Promise(resolve => setTimeout(resolve, 500));
     
     const updatedUser: User = {
       ...user,
       name,
       email,
       role,
       status,
       expirationDate,
     };
     
     onUserUpdated(updatedUser);
     setIsLoading(false);
     onClose();
   };
 
   const roles: { value: UserRole; label: string; description: string }[] = [
     { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema' },
     { value: 'manager', label: 'Gerente', description: 'Gestão de veículos e usuários' },
     { value: 'user', label: 'Usuário', description: 'Visualização de veículos permitidos' },
   ];
 
   const statuses: { value: 'active' | 'inactive' | 'pending'; label: string; color: string }[] = [
     { value: 'active', label: 'Ativo', color: 'border-success/50 bg-success/10 text-success' },
     { value: 'inactive', label: 'Bloqueado', color: 'border-destructive/50 bg-destructive/10 text-destructive' },
     { value: 'pending', label: 'Pendente', color: 'border-warning/50 bg-warning/10 text-warning' },
   ];
 
   return (
     <div className="fixed inset-0 z-[2000] flex items-center justify-center">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-background/80 backdrop-blur-sm"
         onClick={onClose}
       />
       
       {/* Modal */}
       <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
         {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
               <UserIcon className="w-5 h-5 text-accent" />
             </div>
             <div>
               <h2 className="font-display font-semibold text-lg">Editar Cliente</h2>
               <p className="text-xs text-muted-foreground">Atualizar dados de {user.name}</p>
             </div>
           </div>
           <Button
             variant="ghost"
             size="icon"
             onClick={onClose}
             className="rounded-full"
           >
             <X className="w-4 h-4" />
           </Button>
         </div>
 
         {/* Content */}
         <div className="p-6 space-y-5">
           {/* Name */}
           <div className="space-y-2">
             <Label className="text-sm font-medium flex items-center gap-2">
               <UserIcon className="w-4 h-4 text-muted-foreground" />
               Nome Completo
             </Label>
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
 
           {/* Email */}
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
 
           {/* Status Selection */}
           <div className="space-y-3">
             <Label className="text-sm font-medium flex items-center gap-2">
               <Shield className="w-4 h-4 text-muted-foreground" />
               Status da Conta
             </Label>
             <div className="grid grid-cols-3 gap-2">
               {statuses.map((s) => (
                 <button
                   key={s.value}
                   type="button"
                   onClick={() => setStatus(s.value)}
                   className={`p-3 rounded-lg border transition-all text-center ${
                     status === s.value
                       ? s.color
                       : 'border-border bg-muted/50 hover:bg-muted text-foreground'
                   }`}
                 >
                   <span className="text-sm font-medium">{s.label}</span>
                 </button>
               ))}
             </div>
           </div>
 
           {/* Expiration Date */}
           <div className="space-y-2">
             <Label className="text-sm font-medium flex items-center gap-2">
               <Calendar className="w-4 h-4 text-muted-foreground" />
               Data de Vencimento
             </Label>
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className={cn(
                     "w-full justify-start text-left font-normal bg-muted border-border",
                     !expirationDate && "text-muted-foreground"
                   )}
                 >
                   <Calendar className="mr-2 h-4 w-4" />
                   {expirationDate ? format(expirationDate, "dd/MM/yyyy") : "Selecione uma data"}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <CalendarComponent
                   mode="single"
                   selected={expirationDate}
                   onSelect={setExpirationDate}
                   initialFocus
                   disabled={(date) => date < new Date()}
                 />
               </PopoverContent>
             </Popover>
             <p className="text-xs text-muted-foreground">
               Deixe em branco para acesso sem vencimento
             </p>
             {expirationDate && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setExpirationDate(undefined)}
                 className="text-xs text-muted-foreground hover:text-destructive"
               >
                 Remover data de vencimento
               </Button>
             )}
           </div>
 
           {/* Role Selection */}
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
                       ? r.value === 'admin'
                         ? 'border-destructive/50 bg-destructive/10'
                         : r.value === 'manager'
                         ? 'border-warning/50 bg-warning/10'
                         : 'border-accent/50 bg-accent/10'
                       : 'border-border bg-muted/50 hover:bg-muted'
                   }`}
                 >
                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                     role === r.value
                       ? r.value === 'admin'
                         ? 'border-destructive'
                         : r.value === 'manager'
                         ? 'border-warning'
                         : 'border-accent'
                       : 'border-muted-foreground'
                   }`}>
                     {role === r.value && (
                       <div className={`w-2 h-2 rounded-full ${
                         r.value === 'admin'
                           ? 'bg-destructive'
                           : r.value === 'manager'
                           ? 'bg-warning'
                           : 'bg-accent'
                       }`} />
                     )}
                   </div>
                   <div>
                     <span className={`text-sm font-medium ${
                       role === r.value
                         ? r.value === 'admin'
                           ? 'text-destructive'
                           : r.value === 'manager'
                           ? 'text-warning'
                           : 'text-accent'
                         : 'text-foreground'
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
 
         {/* Footer */}
         <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
           <Button
             variant="ghost"
             onClick={onClose}
             disabled={isLoading}
           >
             Cancelar
           </Button>
           <Button
             onClick={handleSubmit}
             disabled={isLoading || !name || !email}
             className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
           >
             {isLoading ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Salvando...
               </>
             ) : (
               <>
                 <Save className="w-4 h-4" />
                 Salvar Alterações
               </>
             )}
           </Button>
         </div>
       </div>
     </div>
   );
 }