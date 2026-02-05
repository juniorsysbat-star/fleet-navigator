import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { StatusIndicator } from '@/components/StatusIndicator';
 import { ReportsFloatingButton } from '@/components/reports/ReportsFloatingButton';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-hidden relative">
        {/* Status LED Indicator */}
        <div className="absolute top-3 right-3 z-50">
          <StatusIndicator />
        </div>
        {children}
        {/* Floating Reports Button */}
        <ReportsFloatingButton />
      </main>
    </div>
  );
}
