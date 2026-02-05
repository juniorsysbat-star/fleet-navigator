import { useState, useCallback } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { VehicleMap } from '@/components/VehicleMap';
import { VehicleSidebar } from '@/components/VehicleSidebar';
import { VehicleDetailPanel } from '@/components/VehicleDetailPanel';
import { GeofencePanel } from '@/components/GeofencePanel';
import { MissionPlannerModal } from '@/components/MissionPlannerModal';
import { MissionTracker } from '@/components/MissionTracker';
import { PanelDock, PanelType } from '@/components/PanelDock';
import { AlertCircle, Database } from 'lucide-react';
import { generateMockTrail, MOCK_TRAILS } from '@/data/mockVehicles';
import { MOCK_GEOFENCES, Geofence } from '@/data/mockGeofences';
import { Mission } from '@/types/mission';

type PanelState = 'open' | 'minimized' | 'closed';

interface PanelStates {
  vehicleList: PanelState;
  vehicleDetail: PanelState;
  geofence: PanelState;
  mission: PanelState;
}

const Dashboard = () => {
  // Vehicle selection state
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showTrail, setShowTrail] = useState(false);
  const [trailData, setTrailData] = useState<{ lat: number; lng: number }[] | null>(null);
  
  // Geofence state
  const [geofences, setGeofences] = useState<Geofence[]>(MOCK_GEOFENCES);
  const [isDrawingGeofence, setIsDrawingGeofence] = useState(false);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(null);
  
  // Mission state
  const [isMissionPlannerOpen, setIsMissionPlannerOpen] = useState(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  
  // Panel visibility state
  const [panelStates, setPanelStates] = useState<PanelStates>({
    vehicleList: 'open',
    vehicleDetail: 'closed',
    geofence: 'open',
    mission: 'closed',
  });
  
  const { vehicles, isLoading, error, lastUpdate, movingCount, stoppedCount, isUsingMockData, refetch } = useVehicles();
  
  const selectedVehicle = vehicles.find(v => v.device_id === selectedVehicleId) || null;

  // Panel management functions
  const setPanelState = useCallback((panel: PanelType, state: PanelState) => {
    setPanelStates(prev => ({ ...prev, [panel]: state }));
  }, []);

  const minimizePanel = useCallback((panel: PanelType) => {
    setPanelState(panel, 'minimized');
  }, [setPanelState]);

  const closePanel = useCallback((panel: PanelType) => {
    setPanelState(panel, 'closed');
    
    // Clear associated data when closing certain panels
    if (panel === 'vehicleDetail') {
      setSelectedVehicleId(null);
      setShowTrail(false);
      setTrailData(null);
    }
    if (panel === 'mission') {
      setActiveMission(null);
    }
  }, [setPanelState]);

  const restorePanel = useCallback((panel: PanelType) => {
    setPanelState(panel, 'open');
  }, [setPanelState]);

  const getMinimizedPanels = (): PanelType[] => {
    return (Object.keys(panelStates) as PanelType[]).filter(
      panel => panelStates[panel] === 'minimized'
    );
  };

  // Vehicle handlers
  const handleVehicleSelect = (id: string) => {
    if (id === selectedVehicleId) return;
    
    setSelectedVehicleId(id);
    setShowTrail(false);
    setTrailData(null);
    setPanelState('vehicleDetail', 'open');
  };

  const handleCloseVehicleDetail = () => {
    closePanel('vehicleDetail');
  };

  const handleMinimizeVehicleDetail = () => {
    minimizePanel('vehicleDetail');
  };

  const handleShowTrail = (vehicleId: string) => {
    if (showTrail) {
      setShowTrail(false);
      setTrailData(null);
    } else {
      const vehicle = vehicles.find(v => v.device_id === vehicleId);
      if (vehicle) {
        const mockTrail = MOCK_TRAILS[vehicleId] || generateMockTrail(vehicle.latitude, vehicle.longitude);
        setTrailData(mockTrail);
        setShowTrail(true);
      }
    }
  };

  // Geofence handlers
  const handleStartDrawing = () => {
    setIsDrawingGeofence(true);
    setSelectedVehicleId(null);
    setPanelState('vehicleDetail', 'closed');
  };

  const handleCancelDrawing = () => {
    setIsDrawingGeofence(false);
  };

  const handleGeofenceDrawn = (coordinates: { lat: number; lng: number }[]) => {
    const newGeofence: Geofence = {
      id: `geo-${Date.now()}`,
      name: `Nova Cerca ${geofences.length + 1}`,
      type: 'polygon',
      coordinates,
      color: ['#00ff88', '#ff4444', '#00bfff', '#ffcc00'][Math.floor(Math.random() * 4)],
      isActive: true,
      alertOnEnter: true,
      alertOnExit: true,
      createdAt: new Date(),
    };
    setGeofences([...geofences, newGeofence]);
    setIsDrawingGeofence(false);
    console.log('✅ Nova cerca virtual criada:', newGeofence.name);
  };

  const handleDeleteGeofence = (id: string) => {
    setGeofences(geofences.filter(g => g.id !== id));
    setSelectedGeofenceId(null);
    console.log('🗑️ Cerca virtual removida:', id);
  };

  const handleToggleGeofence = (id: string) => {
    setGeofences(geofences.map(g => 
      g.id === id ? { ...g, isActive: !g.isActive } : g
    ));
  };

  // Mission handlers
  const handleMissionCreated = (mission: Mission) => {
    setActiveMission(mission);
    setSelectedVehicleId(mission.vehicleId);
    setPanelState('mission', 'open');
    setPanelState('vehicleDetail', 'open');
    console.log('🚀 Nova missão criada:', mission.name);
  };

  const handleCancelMission = () => {
    if (activeMission) {
      console.log('❌ Missão cancelada:', activeMission.name);
      setActiveMission(null);
      setPanelState('mission', 'closed');
    }
  };

  const handleCloseMission = () => {
    closePanel('mission');
  };

  const handleMinimizeMission = () => {
    minimizePanel('mission');
  };

  const missionVehicle = activeMission 
    ? vehicles.find(v => v.device_id === activeMission.vehicleId) 
    : undefined;

  return (
    <div className="h-full w-full flex overflow-hidden bg-background">
      {/* Sidebar - Vehicle List */}
      {panelStates.vehicleList === 'open' && (
        <VehicleSidebar
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={handleVehicleSelect}
          isLoading={isLoading}
          lastUpdate={lastUpdate}
          movingCount={movingCount}
          stoppedCount={stoppedCount}
          onRefresh={refetch}
          onMinimize={() => minimizePanel('vehicleList')}
          onClose={() => closePanel('vehicleList')}
        />
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
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
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--neon-cyan)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-cyan)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-accent/40 pointer-events-none z-10" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-accent/40 pointer-events-none z-10" />

        {/* Map */}
        <VehicleMap
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={handleVehicleSelect}
          trailData={showTrail ? trailData : null}
          geofences={geofences}
          isDrawingGeofence={isDrawingGeofence}
          onGeofenceDrawn={handleGeofenceDrawn}
          selectedGeofenceId={selectedGeofenceId}
          activeMission={activeMission}
        />

        {/* Geofence Panel */}
        {panelStates.geofence === 'open' && (
          <GeofencePanel
            geofences={geofences}
            isDrawing={isDrawingGeofence}
            onStartDrawing={handleStartDrawing}
            onCancelDrawing={handleCancelDrawing}
            onDeleteGeofence={handleDeleteGeofence}
            onToggleGeofence={handleToggleGeofence}
            selectedGeofenceId={selectedGeofenceId}
            onSelectGeofence={setSelectedGeofenceId}
            onMinimize={() => minimizePanel('geofence')}
            onClose={() => closePanel('geofence')}
          />
        )}

        {/* Mission Tracker */}
        {activeMission && panelStates.mission === 'open' && (
          <MissionTracker
            mission={activeMission}
            vehicle={missionVehicle}
            onClose={handleCloseMission}
            onCancelMission={handleCancelMission}
            onMinimize={handleMinimizeMission}
          />
        )}

        {/* Panel Dock - Shows minimized panels */}
        <PanelDock
          minimizedPanels={getMinimizedPanels()}
          onRestorePanel={restorePanel}
          vehicleDetailHasData={selectedVehicle !== null}
          missionHasData={activeMission !== null}
        />

        {/* Status Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-card/90 backdrop-blur-sm border border-border rounded-full flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground uppercase tracking-wide">Online</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <span className="text-foreground font-display tracking-wide">
            {vehicles.length} VEÍCULOS
          </span>
          {activeMission && (
            <>
              <div className="w-px h-4 bg-border" />
              <span className="text-accent font-display tracking-wide">
                MISSÃO ATIVA
              </span>
            </>
          )}
          <div className="w-px h-4 bg-border" />
          <span className="text-muted-foreground font-mono text-[10px]">
            10s
          </span>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedVehicle && !isDrawingGeofence && panelStates.vehicleDetail === 'open' && (
        <VehicleDetailPanel
          vehicle={selectedVehicle}
          onClose={handleCloseVehicleDetail}
          onShowTrail={handleShowTrail}
          isTrailVisible={showTrail}
          onOpenMissionPlanner={() => setIsMissionPlannerOpen(true)}
          onMinimize={handleMinimizeVehicleDetail}
        />
      )}

      {/* Mission Planner Modal */}
      <MissionPlannerModal
        isOpen={isMissionPlannerOpen}
        onClose={() => setIsMissionPlannerOpen(false)}
        vehicles={vehicles}
        onMissionCreated={handleMissionCreated}
      />
    </div>
  );
};

export default Dashboard;
