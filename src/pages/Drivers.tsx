import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  CreditCard,
  Calendar,
  Car,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Driver, DriverFormData } from "@/types/driver";
// REMOVIDO: import { MOCK_DRIVERS } from '@/data/mockDrivers';
import { useVehicles } from "@/hooks/useVehicles"; // Usar hook real
import { DriverModal } from "@/components/drivers/DriverModal";
import { toast } from "@/hooks/use-toast";
import { format, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { API_CONFIG } from "@/config/api"; // Importar config

const Drivers = () => {
  // Começa VAZIO, sem mocks
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();
  const [deleteDriver, setDeleteDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Usa hook real para pegar veículos (para mostrar nomes)
  const { vehicles } = useVehicles();

  // Busca inicial (Simulada ou Real se tiver endpoint)
  useEffect(() => {
    // Aqui você conectaria com /api/drivers se existisse no Traccar
    // Como Traccar oficial exige plugin ou atributo extendido para motorista,
    // vamos deixar vazio por enquanto para não mostrar dados falsos.
    setDrivers([]);
  }, []);

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cnh.includes(searchTerm) ||
      driver.phone.includes(searchTerm),
  );

  const getVehicleName = (vehicleId?: string) => {
    if (!vehicleId) return null;
    const vehicle = vehicles.find((v) => v.device_id === vehicleId);
    return vehicle?.device_name;
  };

  const getCnhStatus = (expiryDate: string) => {
    try {
      const expiry = new Date(expiryDate);
      if (isNaN(expiry.getTime())) return { label: "Inválida", color: "bg-gray-100", icon: AlertTriangle };

      const daysUntil = differenceInDays(expiry, new Date());

      if (isPast(expiry)) {
        return { label: "Vencida", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle };
      }
      if (daysUntil <= 30) {
        return { label: "Vence em breve", color: "bg-warning text-warning-foreground", icon: AlertTriangle };
      }
      return { label: "Válida", color: "bg-success/20 text-success", icon: CheckCircle };
    } catch {
      return { label: "-", color: "", icon: CheckCircle };
    }
  };

  const assignedVehicleIds = drivers.filter((d) => d.currentVehicleId).map((d) => d.currentVehicleId!);

  const handleSaveDriver = (formData: DriverFormData) => {
    // TODO: Conectar com API real no futuro
    if (editingDriver) {
      setDrivers((prev) => prev.map((d) => (d.id === editingDriver.id ? { ...d, ...formData } : d)));
      toast({
        title: "Motorista atualizado!",
        description: `${formData.name} foi atualizado com sucesso.`,
      });
    } else {
      const newDriver: Driver = {
        id: `driver-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        status: "active",
      };
      setDrivers((prev) => [...prev, newDriver]);
      toast({
        title: "Motorista cadastrado!",
        description: `${formData.name} foi adicionado à frota.`,
      });
    }
    setEditingDriver(undefined);
  };

  const handleDeleteDriver = () => {
    if (deleteDriver) {
      setDrivers((prev) => prev.filter((d) => d.id !== deleteDriver.id));
      toast({
        title: "Motorista removido",
        description: `${deleteDriver.name} foi removido da frota.`,
        variant: "destructive",
      });
      setDeleteDriver(null);
    }
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingDriver(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-6 scrollbar-cyber">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">MOTORISTAS</h1>
              <p className="text-sm text-muted-foreground">Gestão de motoristas da frota</p>
            </div>
          </div>

          <Button onClick={openCreateModal} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Plus className="w-4 h-4" />
            Novo Motorista
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNH ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{drivers.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Com Veículo</span>
          </div>
          <p className="text-2xl font-display font-bold text-success">
            {drivers.filter((d) => d.currentVehicleId).length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">CNH Válida</span>
          </div>
          <p className="text-2xl font-display font-bold text-success">
            {drivers.filter((d) => !isPast(new Date(d.cnhExpiry))).length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">CNH Vencida</span>
          </div>
          <p className="text-2xl font-display font-bold text-destructive">
            {drivers.filter((d) => isPast(new Date(d.cnhExpiry))).length}
          </p>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Motorista</TableHead>
              <TableHead className="text-muted-foreground">CNH</TableHead>
              <TableHead className="text-muted-foreground">Telefone</TableHead>
              <TableHead className="text-muted-foreground">Veículo</TableHead>
              <TableHead className="text-muted-foreground">Status CNH</TableHead>
              <TableHead className="text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.map((driver) => {
              const cnhStatus = getCnhStatus(driver.cnhExpiry);
              const StatusIcon = cnhStatus.icon;
              const vehicleName = getVehicleName(driver.currentVehicleId);

              return (
                <TableRow key={driver.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border border-border">
                        {driver.photoUrl ? (
                          <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Desde {format(new Date(driver.createdAt), "MMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground font-mono">{driver.cnh}</p>
                        <p className="text-xs text-muted-foreground">
                          Validade: {format(new Date(driver.cnhExpiry), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{driver.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {vehicleName ? (
                      <Badge variant="outline" className="gap-1 border-accent/30 text-accent">
                        <Car className="w-3 h-3" />
                        {vehicleName}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", cnhStatus.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {cnhStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(driver)}
                        className="h-8 w-8 text-muted-foreground hover:text-accent"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDriver(driver)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredDrivers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum motorista encontrado</p>
            <p className="text-xs text-muted-foreground mt-2">Clique em "Novo Motorista" para cadastrar.</p>
          </div>
        )}
      </div>

      {/* Driver Modal */}
      <DriverModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDriver(undefined);
        }}
        onSave={handleSaveDriver}
        driver={editingDriver}
        assignedVehicleIds={assignedVehicleIds}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDriver} onOpenChange={() => setDeleteDriver(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remover Motorista</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleteDriver?.name}</strong> da frota? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDriver}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Drivers;
