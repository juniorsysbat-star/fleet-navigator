import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Wrench,
  Fuel,
  Users,
  Gauge,
  Leaf,
  AlertTriangle,
  ChevronRight,
  Award,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  MOCK_DRIVER_SCORES, 
  MOCK_MAINTENANCE_PREDICTIONS, 
  MOCK_FUEL_CONSUMPTION,
  ANALYTICS_SUMMARY 
} from '@/data/mockAnalytics';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FuelDashboard } from '@/components/fuel/FuelDashboard';
 import { ReportPdfExport } from '@/components/reports/ReportPdfExport';

const Analytics = () => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-success/10 border-success/30';
    if (score >= 70) return 'bg-warning/10 border-warning/30';
    return 'bg-destructive/10 border-destructive/30';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-accent/20 text-accent';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

   // Dados para o relatório PDF
   const reportData = {
     title: 'Relatório de Analytics da Frota',
     period: `${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
     summary: [
       { label: 'Total de Motoristas', value: ANALYTICS_SUMMARY.totalDrivers },
       { label: 'Score Médio', value: ANALYTICS_SUMMARY.averageScore },
       { label: 'Km Rodados (Mês)', value: `${(ANALYTICS_SUMMARY.totalKmThisMonth / 1000).toFixed(0)}k` },
       { label: 'Combustível Economizado', value: `${ANALYTICS_SUMMARY.fuelSavedLiters}L` },
       { label: 'CO₂ Reduzido', value: `${(ANALYTICS_SUMMARY.co2ReductionKg / 1000).toFixed(1)}t` },
       { label: 'Alertas na Semana', value: ANALYTICS_SUMMARY.alertsThisWeek },
     ],
     tables: [
       {
         title: 'Ranking de Motoristas',
         headers: ['Posição', 'Motorista', 'Veículo', 'Score', 'Km Total', 'Violações'],
         rows: MOCK_DRIVER_SCORES.sort((a, b) => b.score - a.score).map((driver, index) => [
           index + 1,
           driver.name,
           driver.vehicleName,
           driver.score,
           driver.totalKm.toLocaleString(),
           driver.speedViolations + driver.harshBraking + driver.harshTurns,
         ]),
       },
       {
         title: 'Previsão de Manutenção',
         headers: ['Veículo', 'Tipo de Manutenção', 'Urgência', 'Km Atual', 'Previsão'],
         rows: MOCK_MAINTENANCE_PREDICTIONS.map((pred) => [
           pred.vehicleName,
           pred.maintenanceType,
           pred.urgency === 'critical' ? 'URGENTE' : pred.urgency === 'high' ? 'ALTO' : pred.urgency === 'medium' ? 'MÉDIO' : 'BAIXO',
           pred.currentKm.toLocaleString(),
           pred.predictedDate.toLocaleDateString('pt-BR'),
         ]),
       },
     ],
   };
 
  return (
    <div className="h-full overflow-y-auto bg-background p-6 scrollbar-cyber">
      {/* Header */}
      <div className="mb-6">
         <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
              IA ANALYTICS
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestão inteligente de frota com machine learning
            </p>
          </div>
           </div>
           <ReportPdfExport reportData={reportData} type="analytics" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Motoristas</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{ANALYTICS_SUMMARY.totalDrivers}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Score Médio</span>
          </div>
          <p className="text-2xl font-display font-bold text-success">{ANALYTICS_SUMMARY.averageScore}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Km/Mês</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{(ANALYTICS_SUMMARY.totalKmThisMonth / 1000).toFixed(0)}k</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Fuel className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Combustível Economizado</span>
          </div>
          <p className="text-2xl font-display font-bold text-warning">{ANALYTICS_SUMMARY.fuelSavedLiters}L</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">CO₂ Reduzido</span>
          </div>
          <p className="text-2xl font-display font-bold text-success">{(ANALYTICS_SUMMARY.co2ReductionKg / 1000).toFixed(1)}t</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Alertas/Semana</span>
          </div>
          <p className="text-2xl font-display font-bold text-destructive">{ANALYTICS_SUMMARY.alertsThisWeek}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Driver Scores */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold text-foreground">Ranking de Motoristas</h2>
            </div>
            <button className="text-xs text-accent hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            {MOCK_DRIVER_SCORES.sort((a, b) => b.score - a.score).map((driver, index) => (
              <div 
                key={driver.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200 hover:border-accent/50",
                  getScoreBgColor(driver.score)
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm",
                      index === 0 && "bg-warning text-warning-foreground",
                      index === 1 && "bg-muted text-muted-foreground",
                      index === 2 && "bg-warning/50 text-warning-foreground",
                      index > 2 && "bg-secondary text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">{driver.vehicleName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className={cn("font-display text-xl font-bold", getScoreColor(driver.score))}>
                          {driver.score}
                        </span>
                        {getTrendIcon(driver.trend)}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {driver.totalKm.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>🚗 Velocidade: {driver.speedViolations}</span>
                  <span>⚠️ Frenagens: {driver.harshBraking}</span>
                  <span>↩️ Curvas: {driver.harshTurns}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Predictions */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-warning" />
              <h2 className="font-display text-lg font-bold text-foreground">Previsão de Manutenção</h2>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              IA Preditiva
            </span>
          </div>
          
          <div className="space-y-3">
            {MOCK_MAINTENANCE_PREDICTIONS.sort((a, b) => {
              const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            }).map((prediction) => (
              <div 
                key={prediction.vehicleId}
                className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-accent/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{prediction.vehicleName}</p>
                    <p className="text-xs text-muted-foreground">{prediction.maintenanceType}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    getUrgencyColor(prediction.urgency)
                  )}>
                    {prediction.urgency === 'critical' ? 'URGENTE' : 
                     prediction.urgency === 'high' ? 'ALTO' :
                     prediction.urgency === 'medium' ? 'MÉDIO' : 'BAIXO'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(prediction.predictedDate, { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <span>
                    {prediction.currentKm.toLocaleString()} / {prediction.oilChangeKm.toLocaleString()} km
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      prediction.urgency === 'critical' ? 'bg-destructive' :
                      prediction.urgency === 'high' ? 'bg-warning' :
                      prediction.urgency === 'medium' ? 'bg-accent' : 'bg-success'
                    )}
                    style={{ width: `${(prediction.currentKm / prediction.oilChangeKm) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fuel Consumption Chart */}
      <FuelDashboard />
    </div>
  );
};

export default Analytics;
