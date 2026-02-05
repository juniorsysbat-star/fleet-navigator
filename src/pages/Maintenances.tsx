import { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Calendar,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Clock,
  Car,
  Check,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Maintenance, MaintenanceFormData } from '@/types/maintenance';
import { MaintenanceModal } from '@/components/maintenance/MaintenanceModal';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useVehiclesContext } from '@/contexts/VehiclesContext';

const Maintenances = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { vehicles } = useVehiclesContext();

  const filteredMaintenances = maintenances.filter(m => {
    const matchesSearch = m.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: Maintenance['status']) => {
    switch (status) {
      case 'overdue':
        return { 
          label: 'Vencida', 
          color: 'bg-destructive text-destructive-foreground', 
          icon: AlertTriangle,
          dotColor: 'bg-destructive'
        };
      case 'due':
        return { 
          label: 'Próxima', 
          color: 'bg-warning text-warning-foreground', 
          icon: Clock,
          dotColor: 'bg-warning'
        };
      case 'pending':
        return { 
          label: 'Agendada', 
          color: 'bg-accent/20 text-accent', 
          icon: Calendar,
          dotColor: 'bg-accent'
        };
      case 'completed':
        return { 
          label: 'Concluída', 
          color: 'bg-success/20 text-success', 
          icon: CheckCircle,
          dotColor: 'bg-success'
        };
      default:
        return { 
          label: 'Desconhecido', 
          color: 'bg-secondary text-muted-foreground', 
          icon: Clock,
          dotColor: 'bg-muted-foreground'
        };
    }
  };

  const getProgress = (m: Maintenance) => {
    if (m.triggerType === 'odometer' && m.triggerKm && m.currentKm) {
      return Math.min((m.currentKm / m.triggerKm) * 100, 100);
    }
    return 0;
  };

  const handleSaveMaintenance = (formData: MaintenanceFormData) => {
    const vehicle = vehicles.find(v => v.device_id === formData.vehicleId);
    const newMaintenance: Maintenance = {
      id: `maint-${Date.now()}`,
      ...formData,
      vehicleName: vehicle?.device_name || 'Veículo Desconhecido',
      currentKm: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setMaintenances(prev => [...prev, newMaintenance]);
    toast({
      title: 'Manutenção agendada!',
      description: `${formData.type} para ${vehicle?.device_name} foi agendada.`,
    });
  };

  const handleCompleteMaintenance = (id: string) => {
    setMaintenances(prev => prev.map(m => 
      m.id === id 
        ? { ...m, status: 'completed' as const, completedAt: new Date().toISOString() }
        : m
    ));
    toast({
      title: 'Manutenção concluída!',
      description: 'O registro foi atualizado com sucesso.',
    });
  };

  const stats = {
    total: maintenances.length,
    overdue: maintenances.filter(m => m.status === 'overdue').length,
    due: maintenances.filter(m => m.status === 'due').length,
    pending: maintenances.filter(m => m.status === 'pending').length,
    completed: maintenances.filter(m => m.status === 'completed').length,
  };

  const EmptyState = () => (
    <div className="p-12 text-center rounded-xl bg-card border border-border">
      <Database className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">Sem manutenções</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
        Agende a primeira manutenção para começar a gerenciar a frota.
      </p>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-warning text-warning-foreground hover:bg-warning/90 gap-2"
      >
        <Plus className="w-4 h-4" />
        Agendar Manutenção
      </Button>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-background p-6 scrollbar-cyber">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center border border-warning/30">
              <Wrench className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
                MANUTENÇÕES
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestão preventiva da frota
              </p>
            </div>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-warning text-warning-foreground hover:bg-warning/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Agendar Manutenção
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por veículo ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'overdue', 'due', 'pending', 'completed'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  filterStatus === status && status === 'overdue' && 'bg-destructive text-destructive-foreground',
                  filterStatus === status && status === 'due' && 'bg-warning text-warning-foreground',
                  filterStatus === status && status === 'pending' && 'bg-accent text-accent-foreground',
                  filterStatus === status && status === 'completed' && 'bg-success text-success-foreground',
                )}
              >
                {status === 'all' ? 'Todas' : 
                 status === 'overdue' ? `Vencidas (${stats.overdue})` :
                 status === 'due' ? `Próximas (${stats.due})` :
                 status === 'pending' ? `Agendadas (${stats.pending})` :
                 `Concluídas (${stats.completed})`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Vencidas</span>
          </div>
          <p className="text-2xl font-display font-bold text-destructive">{stats.overdue}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Próximas</span>
          </div>
          <p className="text-2xl font-display font-bold text-warning">{stats.due}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Agendadas</span>
          </div>
          <p className="text-2xl font-display font-bold text-accent">{stats.pending}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-success/10 border border-success/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Concluídas</span>
          </div>
          <p className="text-2xl font-display font-bold text-success">{stats.completed}</p>
        </div>
      </div>

      {/* Maintenance Cards */}
      {filteredMaintenances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaintenances.map((maintenance) => {
            const statusInfo = getStatusInfo(maintenance.status);
            const StatusIcon = statusInfo.icon;
            const progress = getProgress(maintenance);

            return (
              <div 
                key={maintenance.id}
                className={cn(
                  "p-5 rounded-xl border transition-all hover:border-accent/30",
                  maintenance.status === 'overdue' && "bg-destructive/5 border-destructive/30",
                  maintenance.status === 'due' && "bg-warning/5 border-warning/30",
                  maintenance.status === 'pending' && "bg-card border-border",
                  maintenance.status === 'completed' && "bg-success/5 border-success/30 opacity-75",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      maintenance.status === 'overdue' && "bg-destructive/20",
                      maintenance.status === 'due' && "bg-warning/20",
                      maintenance.status === 'pending' && "bg-accent/20",
                      maintenance.status === 'completed' && "bg-success/20",
                    )}>
                      <Wrench className={cn(
                        "w-5 h-5",
                        maintenance.status === 'overdue' && "text-destructive",
                        maintenance.status === 'due' && "text-warning",
                        maintenance.status === 'pending' && "text-accent",
                        maintenance.status === 'completed' && "text-success",
                      )} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{maintenance.type}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Car className="w-3 h-3" />
                        {maintenance.vehicleName}
                      </div>
                    </div>
                  </div>
                  
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Trigger Info */}
                <div className="space-y-3">
                  {maintenance.triggerType === 'date' && maintenance.triggerDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Data:</span>
                      <span className="text-foreground font-medium">
                        {format(new Date(maintenance.triggerDate), 'dd/MM/yyyy')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatDistanceToNow(new Date(maintenance.triggerDate), { addSuffix: true, locale: ptBR })})
                      </span>
                    </div>
                  )}

                  {maintenance.triggerType === 'odometer' && maintenance.triggerKm && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Hodômetro:</span>
                        </div>
                        <span className="text-foreground font-medium">
                          {maintenance.currentKm?.toLocaleString()} / {maintenance.triggerKm.toLocaleString()} km
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className={cn(
                          "h-2",
                          progress >= 100 && "[&>div]:bg-destructive",
                          progress >= 90 && progress < 100 && "[&>div]:bg-warning",
                          progress < 90 && "[&>div]:bg-accent",
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Faltam {Math.max(0, (maintenance.triggerKm - (maintenance.currentKm || 0))).toLocaleString()} km
                      </p>
                    </div>
                  )}

                  {maintenance.notes && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                      {maintenance.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {maintenance.status !== 'completed' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteMaintenance(maintenance.id)}
                      className="w-full gap-2 border-success/30 text-success hover:bg-success/10"
                    >
                      <Check className="w-4 h-4" />
                      Marcar como Concluída
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMaintenance}
      />
    </div>
  );
};

export default Maintenances;
