import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertTriangle, 
  CreditCard, 
  Wrench, 
  Car, 
  FileText,
  Calendar,
  CheckCircle2,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingItem {
  id: string;
  type: 'cnh' | 'maintenance' | 'ipva' | 'insurance' | 'licensing';
  title: string;
  description: string;
  daysUntil: number;
  severity: 'critical' | 'warning' | 'info';
}

export function PendingItemsModal() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Este modal agora não abre automaticamente pois não há dados mock
    // Será preenchido quando a API de pendências for implementada
    if (isAuthenticated && !hasShown && pendingItems.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasShown, pendingItems.length]);

  const getItemIcon = (type: PendingItem['type']) => {
    switch (type) {
      case 'cnh':
        return <FileText className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'ipva':
      case 'insurance':
      case 'licensing':
        return <Car className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: PendingItem['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'info':
        return 'bg-accent/10 text-accent border-accent/30';
    }
  };

  // Não renderiza o modal se não há itens pendentes
  if (pendingItems.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Atenção Necessária
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-lg border flex items-start gap-3",
                  getSeverityColor(item.severity)
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {getItemIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.daysUntil <= 0 
                      ? 'Vencido!' 
                      : `${item.daysUntil} dias restantes`
                    }
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} className="w-full gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
