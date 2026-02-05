 import { Announcement } from '@/types/announcement';
 
 export const mockAnnouncements: Announcement[] = [
   {
     id: 'ann-1',
     title: 'Manutenção Programada',
     message: 'O sistema ficará indisponível no dia 15/02 das 02:00 às 04:00 para manutenção preventiva. Pedimos desculpas pelo inconveniente.',
     type: 'maintenance',
     recipientType: 'all',
     createdAt: new Date('2024-02-10'),
     createdBy: 'Admin Sistema',
     readBy: [
       { userId: 'user-1', userName: 'João Silva', readAt: new Date('2024-02-10T10:30:00') },
       { userId: 'user-2', userName: 'Maria Santos', readAt: new Date('2024-02-10T11:15:00') },
     ],
   },
   {
     id: 'ann-2',
     title: 'Fatura em Atraso',
     message: 'Identificamos pendências financeiras em sua conta. Por favor, regularize sua situação para evitar suspensão dos serviços.',
     type: 'billing',
     recipientType: 'overdue',
     createdAt: new Date('2024-02-08'),
     createdBy: 'Admin Sistema',
     readBy: [],
   },
   {
     id: 'ann-3',
     title: 'Promoção de Verão',
     message: 'Aproveite 20% de desconto na contratação de novos rastreadores até o final do mês! Use o cupom VERAO2024.',
     type: 'promotion',
     recipientType: 'embarcadores',
     createdAt: new Date('2024-02-05'),
     createdBy: 'Admin Sistema',
     readBy: [
       { userId: 'emb-1', userName: 'Transportadora ABC', readAt: new Date('2024-02-05T14:20:00') },
     ],
   },
 ];
 
 // Simula buscar comunicados não lidos para um usuário
 export function getUnreadAnnouncements(userId: string, userRole: string): Announcement[] {
   return mockAnnouncements.filter((ann) => {
     // Verifica se usuário já leu
     const alreadyRead = ann.readBy.some((r) => r.userId === userId);
     if (alreadyRead) return false;
 
     // Filtra por tipo de destinatário
     switch (ann.recipientType) {
       case 'all':
         return true;
       case 'embarcadores':
         return userRole === 'embarcador';
       case 'overdue':
         // Em produção, verificaria status financeiro
         return false;
       case 'specific':
         return ann.specificRecipientId === userId;
       default:
         return false;
     }
   });
 }
 
 // Marca comunicado como lido
 export function markAnnouncementAsRead(announcementId: string, userId: string, userName: string): void {
   const announcement = mockAnnouncements.find((a) => a.id === announcementId);
   if (announcement) {
     announcement.readBy.push({
       userId,
       userName,
       readAt: new Date(),
     });
   }
 }