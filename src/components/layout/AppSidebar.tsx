import { NavLink, useLocation } from 'react-router-dom';
import { 
  Map, 
  Brain, 
  CreditCard, 
  Settings, 
  Navigation,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { 
    path: '/', 
    icon: Map, 
    label: 'Rastreamento', 
    description: 'Mapa em tempo real' 
  },
  { 
    path: '/analytics', 
    icon: Brain, 
    label: 'IA Analytics', 
    description: 'Gestão inteligente' 
  },
  { 
    path: '/billing', 
    icon: CreditCard, 
    label: 'Financeiro', 
    description: 'Cobranças e clientes' 
  },
  { 
    path: '/admin/users', 
    icon: Users, 
    label: 'Usuários', 
    description: 'Gestão de clientes' 
  },
  { 
    path: '/settings', 
    icon: Settings, 
    label: 'Configurações', 
    description: 'Preferências' 
  },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-[200px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center border border-accent/40 shrink-0 relative">
            <Navigation className="w-5 h-5 text-accent" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-bold text-sm text-foreground tracking-wider">
                FLEET<span className="text-accent">AI</span>
              </h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                Pro Platform
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          const linkContent = (
            <NavLink
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
              )}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none" />
              )}
              
              <Icon 
                className={cn(
                  "w-5 h-5 shrink-0 transition-all duration-200 relative z-10",
                  isActive && "drop-shadow-[0_0_8px_hsl(var(--accent))]"
                )} 
              />
              
              {!isCollapsed && (
                <div className="flex flex-col animate-fade-in relative z-10">
                  <span className={cn(
                    "text-sm font-semibold",
                    isActive && "text-accent"
                  )}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              )}

              {/* Active bar */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full shadow-[0_0_10px_hsl(var(--accent))]" />
              )}
            </NavLink>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent hover:border-border"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
