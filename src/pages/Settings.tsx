import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Database, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhiteLabelPanel } from '@/components/settings/WhiteLabelPanel';

type SettingsView = 'menu' | 'appearance';

const Settings = () => {
  const [currentView, setCurrentView] = useState<SettingsView>('menu');

  const menuItems = [
    { 
      id: 'notifications' as const, 
      icon: Bell, 
      title: 'Notificações', 
      desc: 'Configurar alertas e notificações',
      available: false
    },
    { 
      id: 'security' as const, 
      icon: Shield, 
      title: 'Segurança', 
      desc: 'Senhas, autenticação e acessos',
      available: false
    },
    { 
      id: 'appearance' as const, 
      icon: Palette, 
      title: 'Aparência', 
      desc: 'Tema, cores e personalização (White Label)',
      available: true
    },
    { 
      id: 'locale' as const, 
      icon: Globe, 
      title: 'Idioma e Região', 
      desc: 'Fuso horário e formatos',
      available: false
    },
    { 
      id: 'integrations' as const, 
      icon: Database, 
      title: 'API & Integrações', 
      desc: 'Conexões com sistemas externos',
      available: false
    },
  ];

  if (currentView === 'appearance') {
    return (
      <div className="h-full overflow-y-auto bg-background p-6 scrollbar-cyber">
        {/* Header with Back */}
        <div className="mb-6">
          <button
            onClick={() => setCurrentView('menu')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
              <Palette className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
                APARÊNCIA
              </h1>
              <p className="text-sm text-muted-foreground">
                Personalização White Label do sistema
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <WhiteLabelPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-6 scrollbar-cyber">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted/50 to-card flex items-center justify-center border border-border">
            <SettingsIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
              CONFIGURAÇÕES
            </h1>
            <p className="text-sm text-muted-foreground">
              Preferências e configurações do sistema
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={() => item.available && setCurrentView(item.id as SettingsView)}
            disabled={!item.available}
            className={cn(
              "p-4 rounded-xl bg-card border border-border transition-all text-left flex items-center gap-4 group",
              item.available 
                ? "hover:border-accent/30 cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-all">
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {item.available && (
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all" />
            )}
            {!item.available && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                Em breve
              </span>
            )}
          </button>
        ))}
      </div>
      
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-2xl">
        FleetAI Pro Platform v1.0.0 • © 2025 Todos os direitos reservados
      </p>
    </div>
  );
};

export default Settings;
