 import { useState } from 'react';
 import { Megaphone, Plus, Users, Clock, CheckCircle, Search } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { CreateAnnouncementModal } from '@/components/announcements/CreateAnnouncementModal';
 import { mockAnnouncements } from '@/data/mockAnnouncements';
 import { announcementTypeConfig, recipientTypeLabels } from '@/types/announcement';
 import { useAuth } from '@/contexts/AuthContext';
 import { cn } from '@/lib/utils';
 
 export default function Announcements() {
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const { user } = useAuth();
 
   // Apenas admin e manager podem acessar
   if (!user || (user.role !== 'super_admin' && user.role !== 'manager' && user.role !== 'embarcador')) {
     return (
       <div className="h-full flex items-center justify-center">
         <p className="text-muted-foreground">Acesso não autorizado</p>
       </div>
     );
   }
 
   const filteredAnnouncements = mockAnnouncements.filter((ann) =>
     ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ann.message.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getTypeStyles = (type: keyof typeof announcementTypeConfig) => {
     switch (type) {
       case 'maintenance':
         return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
       case 'billing':
         return 'bg-destructive/10 text-destructive border-destructive/30';
       case 'promotion':
         return 'bg-success/10 text-success border-success/30';
     }
   };
 
   return (
     <div className="h-full flex flex-col bg-background">
       {/* Header */}
       <div className="shrink-0 p-6 border-b border-border">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
               <Megaphone className="w-5 h-5 text-accent" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-foreground">Central de Comunicados</h1>
               <p className="text-sm text-muted-foreground">Gerencie avisos e notificações para usuários</p>
             </div>
           </div>
           <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
             <Plus className="w-4 h-4" />
             Novo Comunicado
           </Button>
         </div>
 
         <div className="relative max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Buscar comunicados..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10"
           />
         </div>
       </div>
 
       {/* List */}
       <div className="flex-1 overflow-auto p-6">
         <div className="space-y-4">
           {filteredAnnouncements.map((announcement) => {
             const config = announcementTypeConfig[announcement.type];
             const readCount = announcement.readBy.length;
 
             return (
               <div
                 key={announcement.id}
                 className="p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-all"
               >
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                       <span className={cn(
                         "text-xs px-2 py-0.5 rounded-full font-medium border",
                         getTypeStyles(announcement.type)
                       )}>
                         {config.label}
                       </span>
                       <span className="text-xs text-muted-foreground flex items-center gap-1">
                         <Users className="w-3 h-3" />
                         {recipientTypeLabels[announcement.recipientType]}
                       </span>
                     </div>
                     <h3 className="font-semibold text-foreground mb-1">{announcement.title}</h3>
                     <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                   </div>
 
                   <div className="text-right shrink-0">
                     <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                       <Clock className="w-3 h-3" />
                       {announcement.createdAt.toLocaleDateString('pt-BR')}
                     </div>
                     <div className="flex items-center gap-1 text-xs text-success">
                       <CheckCircle className="w-3 h-3" />
                       {readCount} leitura(s)
                     </div>
                   </div>
                 </div>
 
                 {/* Read logs */}
                 {readCount > 0 && (
                   <div className="mt-3 pt-3 border-t border-border">
                     <p className="text-xs text-muted-foreground mb-2">Log de Leituras:</p>
                     <div className="flex flex-wrap gap-2">
                       {announcement.readBy.slice(0, 5).map((read, idx) => (
                         <span
                           key={idx}
                           className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                         >
                           {read.userName} - {read.readAt.toLocaleString('pt-BR')}
                         </span>
                       ))}
                       {readCount > 5 && (
                         <span className="text-xs text-muted-foreground">
                           +{readCount - 5} mais
                         </span>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             );
           })}
 
           {filteredAnnouncements.length === 0 && (
             <div className="text-center py-12">
               <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
               <p className="text-muted-foreground">Nenhum comunicado encontrado</p>
             </div>
           )}
         </div>
       </div>
 
       <CreateAnnouncementModal
         isOpen={isCreateModalOpen}
         onClose={() => setIsCreateModalOpen(false)}
       />
     </div>
   );
 }