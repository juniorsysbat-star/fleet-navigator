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
  role: z.enum(['admin', 'manager', 'user']),
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onUserCreated({ name, email, password, role });
    
    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setIsLoading(false);
    onClose();
  };

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema' },
    { value: 'manager', label: 'Gerente', description: 'Gestão de veículos e usuários' },
    { value: 'user', label: 'Usuário', description: 'Visualização de veículos permitidos' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
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

          {/* Password */}
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
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
