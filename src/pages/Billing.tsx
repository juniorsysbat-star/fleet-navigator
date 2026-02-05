import { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  Search,
  Plus,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportPdfExport } from '@/components/reports/ReportPdfExport';

// Tipos para clientes (serão preenchidos pela API)
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'basic' | 'pro' | 'enterprise';
  vehicleCount: number;
  monthlyValue: number;
  status: 'active' | 'overdue';
  overdueAmount?: number;
  lastPayment: Date;
  dueDate: Date;
}

interface BillingSummary {
  totalRevenue: number;
  projectedRevenue: number;
  totalClients: number;
  newClientsThisMonth: number;
  delinquencyRate: number;
  overdueAmount: number;
  overdueClients: number;
}

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue'>('all');

  // Estados vazios - serão preenchidos pela API
  const clients: Client[] = [];
  const summary: BillingSummary = {
    totalRevenue: 0,
    projectedRevenue: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    delinquencyRate: 0,
    overdueAmount: 0,
    overdueClients: 0,
  };

  const reportData = {
    title: 'Relatório Financeiro',
    period: `${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
    summary: [
      { label: 'Faturamento Mensal', value: `R$ ${summary.totalRevenue.toLocaleString()}` },
      { label: 'Projeção Próximo Mês', value: `R$ ${summary.projectedRevenue.toLocaleString()}` },
      { label: 'Total de Clientes', value: summary.totalClients },
      { label: 'Novos Clientes (Mês)', value: summary.newClientsThisMonth },
      { label: 'Taxa de Inadimplência', value: `${summary.delinquencyRate.toFixed(1)}%` },
      { label: 'Valor em Atraso', value: `R$ ${summary.overdueAmount.toLocaleString()}` },
    ],
    tables: [],
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return client.status === 'active';
    if (statusFilter === 'overdue') return client.status === 'overdue';
    return true;
  });

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-accent/20 text-accent border-accent/30';
      case 'pro': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const handleGenerateBoleto = (client: Client) => {
    console.log(`📄 Gerando boleto PIX para: ${client.name}`);
  };

  const EmptyState = () => (
    <div className="p-12 text-center">
      <Database className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">Sem dados financeiros</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Os dados de clientes e cobranças aparecerão aqui quando disponíveis.
      </p>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-background p-6 scrollbar-cyber">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-accent/20 flex items-center justify-center border border-success/30">
              <CreditCard className="w-6 h-6 text-success" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
                FINANCEIRO
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestão de cobranças e clientes
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
            <ReportPdfExport reportData={reportData} type="billing" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl bg-gradient-to-br from-success/10 to-card border border-success/30">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-success" />
            <span className="text-xs text-success bg-success/20 px-2 py-1 rounded">+0%</span>
          </div>
          <p className="text-3xl font-display font-bold text-success">
            R$ {summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Faturamento Mensal</p>
        </div>
        
        <div className="p-5 rounded-xl bg-gradient-to-br from-destructive/10 to-card border border-destructive/30">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-3xl font-display font-bold text-destructive">
            {summary.delinquencyRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Taxa de Inadimplência</p>
        </div>
        
        <div className="p-5 rounded-xl bg-gradient-to-br from-accent/10 to-card border border-accent/30">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-accent" />
            <span className="text-xs text-accent bg-accent/20 px-2 py-1 rounded">
              +{summary.newClientsThisMonth}
            </span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {summary.totalClients}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total de Clientes</p>
        </div>
        
        <div className="p-5 rounded-xl bg-gradient-to-br from-warning/10 to-card border border-warning/30">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-warning" />
          </div>
          <p className="text-3xl font-display font-bold text-warning">
            R$ {summary.projectedRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Projeção Próximo Mês</p>
        </div>
      </div>

      {/* Client List */}
      <div className="rounded-xl bg-card border border-border">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'active', 'overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === status
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Em dia' : 'Atrasados'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="divide-y divide-border">
          {filteredClients.map((client) => (
            <div 
              key={client.id}
              className="p-4 hover:bg-secondary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{client.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                        getPlanBadge(client.plan)
                      )}>
                        {client.plan}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {client.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3" /> {client.vehicleCount} veículos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-foreground">
                      R$ {client.monthlyValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {client.status === 'active' ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-xs font-medium text-success">Em dia</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-xs font-medium text-destructive">Atrasado</span>
                        </div>
                        <span className="text-[10px] text-destructive mt-1">
                          R$ {client.overdueAmount?.toLocaleString()} em aberto
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleGenerateBoleto(client)}
                  >
                    <QrCode className="w-4 h-4" />
                    Gerar Boleto Pix
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground pl-16">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Último pagamento: {formatDistanceToNow(client.lastPayment, { addSuffix: true, locale: ptBR })}
                </span>
                <span>|</span>
                <span>
                  Vencimento: {client.dueDate.toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && <EmptyState />}
      </div>
    </div>
  );
};

export default Billing;
