import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
