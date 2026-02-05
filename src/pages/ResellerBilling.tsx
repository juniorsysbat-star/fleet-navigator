import { Database } from 'lucide-react';

export default function ResellerBilling() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-background p-6">
      <Database className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">
        Financeiro Revenda
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        Esta funcionalidade requer integração com a API de faturamento.
      </p>
    </div>
  );
}
