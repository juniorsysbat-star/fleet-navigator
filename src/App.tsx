 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AppLayout } from "@/components/layout/AppLayout";
 import { CustomizationProvider } from "@/contexts/CustomizationContext";
 import { LanguageProvider } from "@/contexts/LanguageContext";
 import { AuthProvider } from "@/contexts/AuthContext";
 import Dashboard from "./pages/Dashboard";
 import Analytics from "./pages/Analytics";
 import Billing from "./pages/Billing";
 import Settings from "./pages/Settings";
 import AdminUsers from "./pages/AdminUsers";
 import NotFound from "./pages/NotFound";
 import Login from "./pages/Login";
 import ResellerBilling from "./pages/ResellerBilling";
import Announcements from "./pages/Announcements";
import { AnnouncementModal } from "@/components/announcements/AnnouncementModal";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <AuthProvider>
     <CustomizationProvider>
       <LanguageProvider>
         <QueryClientProvider client={queryClient}>
           <TooltipProvider>
             <Toaster />
             <Sonner />
            <AnnouncementModal />
             <BrowserRouter>
               <Routes>
                 <Route path="/login" element={<Login />} />
                 <Route path="/" element={
                   <AppLayout>
                     <Dashboard />
                   </AppLayout>
                 } />
                 <Route path="/analytics" element={
                   <AppLayout>
                     <Analytics />
                   </AppLayout>
                 } />
                 <Route path="/billing" element={
                   <AppLayout>
                     <Billing />
                   </AppLayout>
                 } />
                 <Route path="/admin/users" element={
                   <AppLayout>
                     <AdminUsers />
                   </AppLayout>
                 } />
                 <Route path="/settings" element={
                   <AppLayout>
                     <Settings />
                   </AppLayout>
                 } />
                 <Route path="/reseller-billing" element={
                   <AppLayout>
                     <ResellerBilling />
                   </AppLayout>
                 } />
              <Route path="/announcements" element={
                <AppLayout>
                  <Announcements />
                </AppLayout>
              } />
                 {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                 <Route path="*" element={<NotFound />} />
               </Routes>
             </BrowserRouter>
           </TooltipProvider>
         </QueryClientProvider>
       </LanguageProvider>
     </CustomizationProvider>
   </AuthProvider>
 );
 
 export default App;