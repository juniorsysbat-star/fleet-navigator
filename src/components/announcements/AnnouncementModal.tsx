 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Megaphone, AlertTriangle, Gift, Wrench } from 'lucide-react';
 import { Announcement, announcementTypeConfig } from '@/types/announcement';
 import { getUnreadAnnouncements, markAnnouncementAsRead } from '@/data/mockAnnouncements';
 import { useAuth } from '@/contexts/AuthContext';
 import { cn } from '@/lib/utils';
 
 export function AnnouncementModal() {
   const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
   const [queue, setQueue] = useState<Announcement[]>([]);
   const { user } = useAuth();
 
   useEffect(() => {
     if (user) {
       const unread = getUnreadAnnouncements(user.id, user.role);
       if (unread.length > 0) {
         setQueue(unread.slice(1));
         setCurrentAnnouncement(unread[0]);
       }
     }
   }, [user]);
 
   const handleAcknowledge = () => {
     if (currentAnnouncement && user) {
       markAnnouncementAsRead(currentAnnouncement.id, user.id, user.name);
       
       if (queue.length > 0) {
         setCurrentAnnouncement(queue[0]);
         setQueue(queue.slice(1));
       } else {
         setCurrentAnnouncement(null);
       }
     }
   };
 
   const getIcon = (type: Announcement['type']) => {
     switch (type) {
       case 'maintenance':
         return <Wrench className="w-6 h-6" />;
       case 'billing':
         return <AlertTriangle className="w-6 h-6" />;
       case 'promotion':
         return <Gift className="w-6 h-6" />;
     }
   };
 
   const getTypeStyles = (type: Announcement['type']) => {
     switch (type) {
       case 'maintenance':
         return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
       case 'billing':
         return 'bg-destructive/10 text-destructive border-destructive/30';
       case 'promotion':
         return 'bg-success/10 text-success border-success/30';
     }
   };
 
   if (!currentAnnouncement) return null;
 
   const config = announcementTypeConfig[currentAnnouncement.type];
 
   return (
     <Dialog open={!!currentAnnouncement} onOpenChange={() => {}}>
       <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
         <DialogHeader>
           <div className={cn(
             "w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 border",
             getTypeStyles(currentAnnouncement.type)
           )}>
             {getIcon(currentAnnouncement.type)}
           </div>
           <DialogTitle className="text-center text-xl">
             {currentAnnouncement.title}
           </DialogTitle>
           <div className="flex justify-center mt-2">
             <span className={cn(
               "text-xs px-2 py-1 rounded-full font-medium",
               getTypeStyles(currentAnnouncement.type)
             )}>
               {config.label}
             </span>
           </div>
         </DialogHeader>
 
         <div className="py-4">
           <p className="text-muted-foreground text-center leading-relaxed">
             {currentAnnouncement.message}
           </p>
           <p className="text-xs text-muted-foreground/60 text-center mt-4">
             Enviado em {currentAnnouncement.createdAt.toLocaleDateString('pt-BR')} por {currentAnnouncement.createdBy}
           </p>
         </div>
 
         <DialogFooter className="sm:justify-center">
           <Button onClick={handleAcknowledge} className="min-w-[120px]">
             Ciente
           </Button>
         </DialogFooter>
 
         {queue.length > 0 && (
           <p className="text-xs text-muted-foreground text-center mt-2">
             +{queue.length} comunicado(s) pendente(s)
           </p>
         )}
       </DialogContent>
     </Dialog>
   );
 }