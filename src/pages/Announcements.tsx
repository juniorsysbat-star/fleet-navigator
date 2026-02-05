import { useState } from 'react';
import { Megaphone, Plus, Users, Clock, CheckCircle, Search, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateAnnouncementModal } from '@/components/announcements/CreateAnnouncementModal';
import { announcementTypeConfig, recipientTypeLabels, Announcement } from '@/types/announcement';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Announcements() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { user } = useAuth();

  // Apenas admin e manager podem acessar
  if (!user || (user.role !== 'super_admin' && user.role !== 'manager' && user.role !== 'embarcador')) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Acesso não autorizado</p>
      </div>
    );
  }

  const filteredAnnouncements = announcements.filter((ann) =>
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

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Database className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">Sem comunicados</h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center mb-4">
        Crie um novo comunicado para enviar avisos aos usuários.
      </p>
      <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Novo Comunicado
      </Button>
    </div>
  );

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

        {/* Search */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-cyber">
        {filteredAnnouncements.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnouncements.map((ann) => (
              <div 
                key={ann.id}
                className="p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded border",
                    getTypeStyles(ann.type)
                  )}>
                    {announcementTypeConfig[ann.type].label}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ann.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-2">{ann.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ann.message}</p>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {recipientTypeLabels[ann.recipientType]}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle className="w-3 h-3" />
                    <span>0 lidos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateAnnouncementModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
