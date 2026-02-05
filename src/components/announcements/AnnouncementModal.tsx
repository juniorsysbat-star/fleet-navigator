import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, AlertTriangle, Gift, Wrench } from 'lucide-react';
import { Announcement, announcementTypeConfig } from '@/types/announcement';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function AnnouncementModal() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [queue, setQueue] = useState<Announcement[]>([]);
  const { user } = useAuth();

  // Este modal não abre automaticamente pois não há dados mock
  // Será preenchido quando a API de comunicados for implementada

  const handleAcknowledge = () => {
    if (queue.length > 0) {
      setCurrentAnnouncement(queue[0]);
      setQueue(queue.slice(1));
    } else {
      setCurrentAnnouncement(null);
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
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground text-center whitespace-pre-line">
            {currentAnnouncement.message}
          </p>
        </div>

        <DialogFooter>
          <Button onClick={handleAcknowledge} className="w-full gap-2">
            <Megaphone className="w-4 h-4" />
            Ciente
            {queue.length > 0 && (
              <span className="ml-1 text-xs opacity-70">
                (+{queue.length} restantes)
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
