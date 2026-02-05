 import { useState, useEffect } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
import { Driver, DriverFormData } from '@/types/driver';
import { useVehiclesContext } from '@/contexts/VehiclesContext';
import { User, Phone, CreditCard, Calendar, Car, Camera, QrCode, Smartphone } from 'lucide-react';
import { QRCodePhotoCapture } from './QRCodePhotoCapture';
 
 interface DriverModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (data: DriverFormData) => void;
   driver?: Driver;
   assignedVehicleIds: string[];
 }
 
export function DriverModal({ isOpen, onClose, onSave, driver, assignedVehicleIds }: DriverModalProps) {
  const { vehicles } = useVehiclesContext();
   const [formData, setFormData] = useState<DriverFormData>({
     name: '',
     cnh: '',
     cnhExpiry: '',
     phone: '',
     photoUrl: '',
     currentVehicleId: '',
   });
  const [showQRCapture, setShowQRCapture] = useState(false);
 
   useEffect(() => {
     if (driver) {
       setFormData({
         name: driver.name,
         cnh: driver.cnh,
         cnhExpiry: driver.cnhExpiry,
         phone: driver.phone,
         photoUrl: driver.photoUrl || '',
         currentVehicleId: driver.currentVehicleId || '',
       });
     } else {
       setFormData({
         name: '',
         cnh: '',
         cnhExpiry: '',
         phone: '',
         photoUrl: '',
         currentVehicleId: '',
       });
     }
   }, [driver, isOpen]);
  
  // Reset QR capture when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowQRCapture(false);
    }
  }, [isOpen]);

  const handleQRPhotoCapture = (photoUrl: string) => {
    setFormData({ ...formData, photoUrl });
    setShowQRCapture(false);
  };
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     onSave(formData);
     onClose();
   };
 
   // Veículos disponíveis (não atribuídos a outros motoristas)
    const availableVehicles = vehicles.filter(
      v => !assignedVehicleIds.includes(v.device_id) || v.device_id === driver?.currentVehicleId
    );
 
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-[500px] bg-card border-border">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-foreground">
             <User className="w-5 h-5 text-accent" />
             {driver ? 'Editar Motorista' : 'Novo Motorista'}
           </DialogTitle>
         </DialogHeader>
 
        {showQRCapture ? (
          <QRCodePhotoCapture 
            onPhotoCapture={handleQRPhotoCapture}
            onCancel={() => setShowQRCapture(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto Preview */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              {/* Botão QR Code */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQRCapture(true)}
                className="gap-2 text-accent border-accent/30 hover:bg-accent/10"
              >
                <QrCode className="w-4 h-4" />
                <Smartphone className="w-4 h-4" />
                Coletar Foto via Celular
              </Button>
             </div>
 
            {/* URL da Foto */}
            <div className="space-y-2">
              <Label htmlFor="photoUrl" className="flex items-center gap-2 text-muted-foreground">
                <Camera className="w-4 h-4" />
                URL da Foto (opcional)
              </Label>
              <Input
                id="photoUrl"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://exemplo.com/foto.jpg"
                className="bg-secondary border-border"
              />
            </div>
 
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João da Silva"
                required
                className="bg-secondary border-border"
              />
            </div>
 
            <div className="grid grid-cols-2 gap-4">
              {/* CNH */}
              <div className="space-y-2">
                <Label htmlFor="cnh" className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  Número CNH *
                </Label>
                <Input
                  id="cnh"
                  value={formData.cnh}
                  onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                  placeholder="12345678901"
                  maxLength={11}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              {/* Validade CNH */}
              <div className="space-y-2">
                <Label htmlFor="cnhExpiry" className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Validade *
                </Label>
                <Input
                  id="cnhExpiry"
                  type="date"
                  value={formData.cnhExpiry}
                  onChange={(e) => setFormData({ ...formData, cnhExpiry: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>
             </div>
 
            {/* Telefone */}
             <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                Telefone *
               </Label>
               <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                 required
                 className="bg-secondary border-border"
               />
             </div>
 
            {/* Veículo Atual */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Car className="w-4 h-4" />
                Veículo Atual (opcional)
              </Label>
              <Select
                value={formData.currentVehicleId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, currentVehicleId: value === 'none' ? '' : value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum veículo</SelectItem>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.device_id} value={vehicle.device_id}>
                      {vehicle.device_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
 
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                {driver ? 'Salvar Alterações' : 'Cadastrar Motorista'}
              </Button>
            </DialogFooter>
          </form>
        )}
       </DialogContent>
     </Dialog>
   );
 }