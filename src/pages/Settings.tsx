import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Database } from 'lucide-react';

const Settings = () => {
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
        {[
          { icon: Bell, title: 'Notificações', desc: 'Configurar alertas e notificações' },
          { icon: Shield, title: 'Segurança', desc: 'Senhas, autenticação e acessos' },
          { icon: Palette, title: 'Aparência', desc: 'Tema, cores e personalização' },
          { icon: Globe, title: 'Idioma e Região', desc: 'Fuso horário e formatos' },
          { icon: Database, title: 'API & Integrações', desc: 'Conexões com sistemas externos' },
        ].map((item) => (
          <button
            key={item.title}
            className="p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all text-left flex items-center gap-4 group"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-all">
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-all" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
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
