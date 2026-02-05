 export type AnnouncementType = 'maintenance' | 'billing' | 'promotion';
 export type RecipientType = 'all' | 'overdue' | 'embarcadores' | 'specific';
 
 export interface Announcement {
   id: string;
   title: string;
   message: string;
   type: AnnouncementType;
   recipientType: RecipientType;
   specificRecipientId?: string;
   createdAt: Date;
   createdBy: string;
   readBy: {
     userId: string;
     userName: string;
     readAt: Date;
   }[];
 }
 
 export const announcementTypeConfig: Record<AnnouncementType, { label: string; color: string; bgColor: string }> = {
   maintenance: { label: 'Aviso de Manutenção', color: 'text-blue-600', bgColor: 'bg-blue-500' },
   billing: { label: 'Cobrança', color: 'text-red-600', bgColor: 'bg-destructive' },
   promotion: { label: 'Promoção', color: 'text-green-600', bgColor: 'bg-success' },
 };
 
 export const recipientTypeLabels: Record<RecipientType, string> = {
   all: 'Todos os Usuários',
   overdue: 'Apenas Inadimplentes',
   embarcadores: 'Apenas Embarcadores',
   specific: 'Cliente Específico',
 };