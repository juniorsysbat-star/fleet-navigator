import { useState } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { VehicleMap } from '@/components/VehicleMap';
import { VehicleSidebar } from '@/components/VehicleSidebar';
import { AlertCircle, Database } from 'lucide-react';

const Dashboard = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const { vehicles, isLoading, error, lastUpdate, movingCount, stoppedCount, isUsingMockData, refetch } = useVehicles();
  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id === selectedVehicleId ? null : id);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <VehicleSidebar
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onVehicleSelect={handleVehicleSelect}
        isLoading={isLoading}
        lastUpdate={lastUpdate}
        movingCount={movingCount}
        stoppedCount={stoppedCount}
        onRefresh={refetch}
      />

      {/* Map Container */}
      <main className="flex-1 relative">
        {/* Mock Data Banner */}
        {isUsingMockData && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-warning/90 text-warning-foreground rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-sm border border-warning/50">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">Modo Demo - Dados Simulados</span>
          </div>
        )}

        {/* Error Banner */}
        {error && !isUsingMockData && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-destructive/90 text-destructive-foreground rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Grid Overlay Effect */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--neon-cyan)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-cyan)) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div 
            className="w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent animate-scan-line"
          />
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-accent/50 pointer-events-none z-10" />
        <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-accent/50 pointer-events-none z-10" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-accent/50 pointer-events-none z-10" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-accent/50 pointer-events-none z-10" />

        {/* Map */}
        <VehicleMap
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={handleVehicleSelect}
        />

        {/* Status Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-card/90 backdrop-blur-sm border border-border rounded-full flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">SISTEMA ONLINE</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <span className="text-foreground font-display">
            {vehicles.length} VEÍCULOS MONITORADOS
          </span>
          <div className="w-px h-4 bg-border" />
          <span className="text-muted-foreground">
            REFRESH: 10s
          </span>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
