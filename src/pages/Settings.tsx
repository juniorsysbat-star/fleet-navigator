import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Database, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { WhiteLabelPanel } from '@/components/settings/WhiteLabelPanel';
import { NotificationsPanel } from '@/components/settings/NotificationsPanel';
import { SecurityPanel } from '@/components/settings/SecurityPanel';
import { IntegrationsPanel } from '@/components/settings/IntegrationsPanel';
import { LocalePanel } from '@/components/settings/LocalePanel';

type SettingsView = 'menu' | 'notifications' | 'security' | 'appearance' | 'locale' | 'integrations';

const Settings = () => {
  const [currentView, setCurrentView] = useState<SettingsView>('menu');
  const { t, isRTL } = useLanguage();

  const menuItems = [
    { 
      id: 'notifications' as const, 
      icon: Bell, 
      titleKey: 'settings.notifications' as const,
      descKey: 'settings.notifications.desc' as const,
    },
    { 
      id: 'security' as const, 
      icon: Shield, 
      titleKey: 'settings.security' as const,
      descKey: 'settings.security.desc' as const,
    },
    { 
      id: 'appearance' as const, 
      icon: Palette, 
      titleKey: 'settings.appearance' as const,
      descKey: 'settings.appearance.desc' as const,
    },
    { 
      id: 'locale' as const, 
      icon: Globe, 
      titleKey: 'settings.locale' as const,
      descKey: 'settings.locale.desc' as const,
    },
    { 
      id: 'integrations' as const, 
      icon: Database, 
      titleKey: 'settings.integrations' as const,
      descKey: 'settings.integrations.desc' as const,
    },
  ];

  const renderPanel = () => {
    switch (currentView) {
      case 'notifications':
        return <NotificationsPanel />;
      case 'security':
        return <SecurityPanel />;
      case 'appearance':
        return <WhiteLabelPanel />;
      case 'locale':
        return <LocalePanel />;
      case 'integrations':
        return <IntegrationsPanel />;
      default:
        return null;
    }
  };

  if (currentView !== 'menu') {
    return (
      <div className={cn("h-full overflow-y-auto bg-background p-6 scrollbar-cyber", isRTL && "text-right")}>
        {/* Header with Back */}
        <div className="mb-6">
          <button
            onClick={() => setCurrentView('menu')}
            className={cn(
              "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4",
              isRTL && "flex-row-reverse"
            )}
          >
            <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
            <span className="text-sm">{t('settings.back')}</span>
          </button>
        </div>

        <div className="max-w-3xl">
          {renderPanel()}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full overflow-y-auto bg-background p-6 scrollbar-cyber", isRTL && "text-right")}>
      {/* Header */}
      <div className="mb-6">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted/50 to-card flex items-center justify-center border border-border">
            <SettingsIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">
              {t('settings.title').toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "p-4 rounded-xl bg-card border border-border transition-all text-left flex items-center gap-4 group",
              "hover:border-accent/30 cursor-pointer",
              isRTL && "flex-row-reverse text-right"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-all">
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{t(item.titleKey)}</p>
              <p className="text-xs text-muted-foreground">{t(item.descKey)}</p>
            </div>
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground group-hover:text-accent transition-all",
              isRTL && "rotate-180"
            )} />
          </button>
        ))}
      </div>
      
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-2xl">
        {t('footer.version')}
      </p>
    </div>
  );
};

export default Settings;
