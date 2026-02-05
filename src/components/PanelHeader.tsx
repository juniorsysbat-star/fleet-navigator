import { X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelHeaderProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PanelHeader({
  title,
  icon,
  badge,
  onClose,
  onMinimize,
  className,
  children,
}: PanelHeaderProps) {
  return (
    <div className={cn("p-4 border-b border-border", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-display font-bold text-foreground">{title}</h3>
          {badge}
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1.5 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
              title="Minimizar"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
