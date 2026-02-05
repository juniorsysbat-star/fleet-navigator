 import { useState } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Label } from '@/components/ui/label';
 import { Send, Wrench, AlertTriangle, Gift } from 'lucide-react';
 import { AnnouncementType, RecipientType, recipientTypeLabels } from '@/types/announcement';
 import { mockAnnouncements } from '@/data/mockAnnouncements';
 import { useAuth } from '@/contexts/AuthContext';
 import { toast } from 'sonner';
 import { cn } from '@/lib/utils';
 
 interface CreateAnnouncementModalProps {
   isOpen: boolean;
   onClose: () => void;
 }
 
 const typeOptions: { value: AnnouncementType; label: string; icon: React.ReactNode; color: string }[] = [
   { value: 'maintenance', label: 'Aviso de Manutenção', icon: <Wrench className="w-4 h-4" />, color: 'text-blue-500' },
   { value: 'billing', label: 'Cobrança', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-destructive' },
   { value: 'promotion', label: 'Promoção', icon: <Gift className="w-4 h-4" />, color: 'text-success' },
 ];
 
 export function CreateAnnouncementModal({ isOpen, onClose }: CreateAnnouncementModalProps) {
   const [title, setTitle] = useState('');
   const [message, setMessage] = useState('');
   const [type, setType] = useState<AnnouncementType>('maintenance');
   const [recipientType, setRecipientType] = useState<RecipientType>('all');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { user } = useAuth();
 
   const handleSubmit = async () => {
     if (!title.trim() || !message.trim()) {
       toast.error('Preencha todos os campos obrigatórios');
       return;
     }
 
     setIsSubmitting(true);
 
     // Simula criação do comunicado
     const newAnnouncement = {
       id: `ann-${Date.now()}`,
       title,
       message,
       type,
       recipientType,
       createdAt: new Date(),
       createdBy: user?.name || 'Sistema',
       readBy: [],
     };
 
     mockAnnouncements.unshift(newAnnouncement);
 
     await new Promise((resolve) => setTimeout(resolve, 500));
 
     toast.success('Comunicado enviado com sucesso!', {
       description: `Destinatários: ${recipientTypeLabels[recipientType]}`,
     });
 
     setTitle('');
     setMessage('');
     setType('maintenance');
     setRecipientType('all');
     setIsSubmitting(false);
     onClose();
   };
 
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-lg">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Send className="w-5 h-5 text-accent" />
             Novo Comunicado
           </DialogTitle>
         </DialogHeader>
 
         <div className="space-y-4 py-4">
           <div className="space-y-2">
             <Label htmlFor="title">Título *</Label>
             <Input
               id="title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="Ex: Manutenção Programada"
             />
           </div>
 
           <div className="space-y-2">
             <Label>Tipo do Comunicado *</Label>
             <div className="grid grid-cols-3 gap-2">
               {typeOptions.map((option) => (
                 <button
                   key={option.value}
                   type="button"
                   onClick={() => setType(option.value)}
                   className={cn(
                     "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                     type === option.value
                       ? "border-accent bg-accent/10"
                       : "border-border hover:border-accent/50"
                   )}
                 >
                   <span className={option.color}>{option.icon}</span>
                   <span className="text-xs font-medium">{option.label}</span>
                 </button>
               ))}
             </div>
           </div>
 
           <div className="space-y-2">
             <Label>Destinatários *</Label>
             <Select value={recipientType} onValueChange={(v) => setRecipientType(v as RecipientType)}>
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {Object.entries(recipientTypeLabels).map(([value, label]) => (
                   <SelectItem key={value} value={value}>
                     {label}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="message">Mensagem *</Label>
             <Textarea
               id="message"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Digite a mensagem do comunicado..."
               rows={4}
             />
           </div>
         </div>
 
         <DialogFooter>
           <Button variant="outline" onClick={onClose}>
             Cancelar
           </Button>
           <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
             <Send className="w-4 h-4" />
             {isSubmitting ? 'Enviando...' : 'Enviar Comunicado'}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }