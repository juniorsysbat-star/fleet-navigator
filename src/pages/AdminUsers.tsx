 import { useState } from 'react';
 import { 
   Users, 
   UserPlus, 
   Search, 
   MoreHorizontal, 
   Car, 
   Shield, 
   Mail,
   Calendar,
   Clock,
   Trash2,
   Edit,
   Link,
   AlertCircle
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { CreateUserModal } from '@/components/admin/CreateUserModal';
 import { EditUserModal } from '@/components/admin/EditUserModal';
 import { VehicleAssociationModal } from '@/components/admin/VehicleAssociationModal';
 import { User, UserRole } from '@/types/user';
import { useVehiclesContext } from '@/contexts/VehiclesContext';
import { VehicleWithStatus } from '@/types/vehicle';
import { toast } from 'sonner';

// Helper functions (moved from mockUsers)
const getRoleLabel = (role: UserRole) => {
  const labels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    embarcador: 'Embarcador',
    manager: 'Gerente',
    user: 'Usuário',
  };
  return labels[role];
};

const getRoleColor = (role: UserRole) => {
  const colors: Record<UserRole, string> = {
    super_admin: 'bg-destructive/10 text-destructive border-destructive/30',
    embarcador: 'bg-accent/10 text-accent border-accent/30',
    manager: 'bg-warning/10 text-warning border-warning/30',
    user: 'bg-secondary text-muted-foreground border-border',
  };
  return colors[role];
};

const getStatusLabel = (status: string) => status === 'active' ? 'Ativo' : 'Inativo';
const getStatusColor = (status: string) => status === 'active' 
  ? 'bg-success/10 text-success border-success/30' 
  : 'bg-muted text-muted-foreground border-border';

const AdminUsers = () => {
  const { vehicles } = useVehiclesContext();
  const [users, setUsers] = useState<User[]>([]);
  const [associations, setAssociations] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForVehicles, setSelectedUserForVehicles] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
 
   const filteredUsers = users.filter(user => {
     const matchesSearch = 
       user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesRole = roleFilter === 'all' || user.role === roleFilter;
     return matchesSearch && matchesRole;
   });
 
  const getUserVehicleCount = (userId: string): number => {
    return associations[userId]?.length || 0;
  };

  const getUserAssociations = (userId: string): string[] => {
    return associations[userId] || [];
  };
 
   const handleCreateUser = (userData: { name: string; email: string; password: string; role: UserRole }) => {
     const newUser: User = {
       id: `user-${Date.now()}`,
       name: userData.name,
       email: userData.email,
       role: userData.role,
       status: 'active',
       createdAt: new Date(),
     };
     setUsers([...users, newUser]);
     toast.success('Cliente criado com sucesso!', {
       description: `${userData.name} foi adicionado ao sistema.`,
     });
   };
 
  const handleSaveVehicleAssociations = (userId: string, vehicleIds: string[]) => {
    setAssociations(prev => ({ ...prev, [userId]: vehicleIds }));
     
     const user = users.find(u => u.id === userId);
     toast.success('Veículos associados!', {
       description: `${vehicleIds.length} veículo(s) vinculado(s) a ${user?.name}.`,
     });
   };
 
   const handleEditUser = (updatedUser: User) => {
     setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
     toast.success('Cliente atualizado!', {
       description: `Os dados de ${updatedUser.name} foram salvos.`,
     });
   };
 
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    setAssociations(prev => {
      const newAssoc = { ...prev };
      delete newAssoc[userId];
      return newAssoc;
    });
     toast.success('Cliente removido', {
       description: `${user?.name} foi removido do sistema.`,
     });
   };
 
   const handleToggleStatus = (userId: string) => {
     setUsers(users.map(u => {
       if (u.id === userId) {
         const newStatus = u.status === 'active' ? 'inactive' : 'active';
         toast.info(`Status alterado para ${getStatusLabel(newStatus)}`);
         return { ...u, status: newStatus };
       }
       return u;
     }));
   };
 
   const formatDate = (date: Date) => {
     return new Intl.DateTimeFormat('pt-BR', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric',
     }).format(date);
   };
 
   const formatDateTime = (date: Date) => {
     return new Intl.DateTimeFormat('pt-BR', {
       day: '2-digit',
       month: '2-digit',
       hour: '2-digit',
       minute: '2-digit',
     }).format(date);
   };
 
   const formatExpirationDate = (date?: Date) => {
     if (!date) return null;
     const now = new Date();
     const isExpired = date < now;
     return {
       text: formatDate(date),
       isExpired,
     };
   };
 
   const stats = {
     total: users.length,
     active: users.filter(u => u.status === 'active').length,
     admins: users.filter(u => u.role === 'super_admin' || u.role === 'embarcador').length,
     managers: users.filter(u => u.role === 'manager').length,
   };
 
   const roleFilters: (UserRole | 'all')[] = ['all', 'super_admin', 'embarcador', 'manager', 'user'];
 
   return (
     <div className="h-full w-full flex flex-col bg-background overflow-hidden">
       <div className="shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
         <div className="p-6">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
                 <Users className="w-6 h-6 text-accent" />
               </div>
               <div>
                 <h1 className="font-display font-bold text-2xl tracking-wide">Gestão de Usuários</h1>
                 <p className="text-sm text-muted-foreground">Administração de clientes e permissões</p>
               </div>
             </div>
             <Button
               onClick={() => setIsCreateModalOpen(true)}
               className="bg-success hover:bg-success/90 text-success-foreground gap-2"
             >
               <UserPlus className="w-4 h-4" />
               Criar Novo Cliente
             </Button>
           </div>
 
           <div className="grid grid-cols-4 gap-4">
             <div className="p-4 rounded-lg bg-muted/50 border border-border">
               <div className="text-2xl font-display font-bold">{stats.total}</div>
               <div className="text-xs text-muted-foreground uppercase tracking-wide">Total</div>
             </div>
             <div className="p-4 rounded-lg bg-success/10 border border-success/30">
               <div className="text-2xl font-display font-bold text-success">{stats.active}</div>
               <div className="text-xs text-muted-foreground uppercase tracking-wide">Ativos</div>
             </div>
             <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
               <div className="text-2xl font-display font-bold text-destructive">{stats.admins}</div>
               <div className="text-xs text-muted-foreground uppercase tracking-wide">Admins</div>
             </div>
             <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
               <div className="text-2xl font-display font-bold text-warning">{stats.managers}</div>
               <div className="text-xs text-muted-foreground uppercase tracking-wide">Gerentes</div>
             </div>
           </div>
         </div>
 
         <div className="px-6 pb-4 flex items-center gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Buscar por nome ou email..."
               className="pl-10 bg-muted border-border"
             />
           </div>
           <div className="flex gap-2">
             {roleFilters.map((role) => (
               <Button
                 key={role}
                 variant={roleFilter === role ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setRoleFilter(role)}
                 className={roleFilter === role ? 'bg-accent text-accent-foreground' : ''}
               >
                 {role === 'all' ? 'Todos' : getRoleLabel(role)}
               </Button>
             ))}
           </div>
         </div>
       </div>
 
       <div className="flex-1 overflow-y-auto p-6">
         <div className="space-y-3">
           {filteredUsers.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p>Nenhum usuário encontrado</p>
             </div>
           ) : (
             filteredUsers.map((user) => (
               <div
                 key={user.id}
                 className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all group"
               >
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center border border-accent/20 text-lg font-bold text-accent">
                   {user.name.charAt(0).toUpperCase()}
                 </div>
 
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-semibold truncate">{user.name}</h3>
                     <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full border ${getRoleColor(user.role)}`}>
                       {getRoleLabel(user.role)}
                     </span>
                     <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full border ${getStatusColor(user.status)}`}>
                       {getStatusLabel(user.status)}
                     </span>
                   </div>
                   <div className="flex items-center gap-4 text-xs text-muted-foreground">
                     <span className="flex items-center gap-1">
                       <Mail className="w-3 h-3" />
                       {user.email}
                     </span>
                     <span className="flex items-center gap-1">
                       <Calendar className="w-3 h-3" />
                       Criado: {formatDate(user.createdAt)}
                     </span>
                     {user.lastLogin && (
                       <span className="flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         Último acesso: {formatDateTime(user.lastLogin)}
                       </span>
                     )}
                     {user.expirationDate && (
                       <span className={`flex items-center gap-1 ${
                         formatExpirationDate(user.expirationDate)?.isExpired 
                           ? 'text-destructive' 
                           : 'text-warning'
                       }`}>
                         <AlertCircle className="w-3 h-3" />
                         Vence: {formatExpirationDate(user.expirationDate)?.text}
                       </span>
                     )}
                   </div>
                 </div>
 
                 <div 
                   className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border cursor-pointer hover:border-accent/30 transition-all"
                   onClick={() => setSelectedUserForVehicles(user)}
                 >
                   <Car className="w-4 h-4 text-accent" />
                   <span className="text-sm font-medium">
                     {user.role === 'super_admin' ? (
                       <span className="text-destructive">Todos</span>
                     ) : (
                       <>{getUserVehicleCount(user.id)} veículo(s)</>
                     )}
                   </span>
                   <Link className="w-3 h-3 text-muted-foreground" />
                 </div>
 
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal className="w-4 h-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-48">
                     <DropdownMenuItem onClick={() => setSelectedUserForVehicles(user)}>
                       <Car className="w-4 h-4 mr-2" />
                       Associar Veículos
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setEditingUser(user)}>
                       <Edit className="w-4 h-4 mr-2" />
                       Editar Cliente
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                       <Shield className="w-4 h-4 mr-2" />
                       {user.status === 'active' ? 'Desativar' : 'Ativar'}
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem 
                       onClick={() => handleDeleteUser(user.id)}
                       className="text-destructive focus:text-destructive"
                     >
                       <Trash2 className="w-4 h-4 mr-2" />
                       Remover
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>
             ))
           )}
         </div>
       </div>
 
       <CreateUserModal
         isOpen={isCreateModalOpen}
         onClose={() => setIsCreateModalOpen(false)}
         onUserCreated={handleCreateUser}
       />
 
       <VehicleAssociationModal
         isOpen={selectedUserForVehicles !== null}
         onClose={() => setSelectedUserForVehicles(null)}
         user={selectedUserForVehicles}
         vehicles={vehicles}
         currentAssociations={selectedUserForVehicles ? getUserAssociations(selectedUserForVehicles.id) : []}
         onSave={handleSaveVehicleAssociations}
       />
 
       <EditUserModal
         isOpen={editingUser !== null}
         onClose={() => setEditingUser(null)}
         user={editingUser}
         onUserUpdated={handleEditUser}
       />
     </div>
   );
 };
 
 export default AdminUsers;