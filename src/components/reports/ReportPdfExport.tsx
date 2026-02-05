 import { useState } from 'react';
 import { FileText, Download, X, Building2, Calendar, Shield } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { useCustomization } from '@/contexts/CustomizationContext';
 import { useAuth } from '@/contexts/AuthContext';
 
 interface ReportData {
   title: string;
   period: string;
   summary: {
     label: string;
     value: string | number;
   }[];
   tables?: {
     title: string;
     headers: string[];
     rows: (string | number)[][];
   }[];
 }
 
 interface ReportPdfExportProps {
   reportData: ReportData;
   type: 'analytics' | 'billing';
 }
 
 export function ReportPdfExport({ reportData, type }: ReportPdfExportProps) {
   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
   const { settings } = useCustomization();
   const { user } = useAuth();
 
   // Só mostra para gerentes ou admin
   if (!user || (user.role !== 'manager' && user.role !== 'super_admin' && user.role !== 'embarcador')) {
     return null;
   }
 
   const handlePrint = () => {
     window.print();
   };
 
   const currentDate = new Date().toLocaleDateString('pt-BR', {
     day: '2-digit',
     month: 'long',
     year: 'numeric',
     hour: '2-digit',
     minute: '2-digit',
   });
 
   return (
     <>
       <Button
         variant="outline"
         className="gap-2"
         onClick={() => setIsPreviewOpen(true)}
       >
         <FileText className="w-4 h-4" />
         Exportar Relatório Oficial (PDF)
       </Button>
 
       <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center justify-between">
               <span>Pré-visualização do Relatório</span>
               <div className="flex gap-2">
                 <Button onClick={handlePrint} className="gap-2">
                   <Download className="w-4 h-4" />
                   Imprimir / Salvar PDF
                 </Button>
               </div>
             </DialogTitle>
           </DialogHeader>
 
           {/* Área de impressão */}
           <div id="print-area" className="bg-white text-black p-8 rounded-lg print:p-0">
             {/* Header do Relatório */}
             <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
               <div className="flex items-center gap-4">
                 {settings.logoUrl ? (
                   <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" />
                 ) : (
                   <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                     <Building2 className="w-6 h-6 text-gray-600" />
                   </div>
                 )}
                 <div>
                   <h1 className="text-xl font-bold text-gray-900">FleetAI Pro Platform</h1>
                   <p className="text-sm text-gray-600">Sistema de Gestão de Frotas</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-sm text-gray-600">Relatório Oficial</p>
                 <p className="text-xs text-gray-500">{currentDate}</p>
               </div>
             </div>
 
             {/* Título e Período */}
             <div className="mb-6">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">{reportData.title}</h2>
               <div className="flex items-center gap-2 text-gray-600">
                 <Calendar className="w-4 h-4" />
                 <span>Período: {reportData.period}</span>
               </div>
             </div>
 
             {/* Resumo Executivo */}
             <div className="mb-8">
               <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                 Resumo Executivo
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {reportData.summary.map((item, index) => (
                   <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                     <p className="text-sm text-gray-600">{item.label}</p>
                     <p className="text-xl font-bold text-gray-900">{item.value}</p>
                   </div>
                 ))}
               </div>
             </div>
 
             {/* Tabelas Detalhadas */}
             {reportData.tables?.map((table, tableIndex) => (
               <div key={tableIndex} className="mb-8">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                   {table.title}
                 </h3>
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-gray-100">
                       {table.headers.map((header, i) => (
                         <th key={i} className="text-left p-3 text-sm font-semibold text-gray-700 border border-gray-200">
                           {header}
                         </th>
                       ))}
                     </tr>
                   </thead>
                   <tbody>
                     {table.rows.map((row, rowIndex) => (
                       <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                         {row.map((cell, cellIndex) => (
                           <td key={cellIndex} className="p-3 text-sm text-gray-700 border border-gray-200">
                             {cell}
                           </td>
                         ))}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ))}
 
             {/* Rodapé */}
             <div className="mt-8 pt-4 border-t-2 border-gray-300">
               <div className="flex items-center justify-between text-sm text-gray-600">
                 <div className="flex items-center gap-2">
                   <Shield className="w-4 h-4" />
                   <span>Documento gerado eletronicamente</span>
                 </div>
                 <div className="text-right">
                   <p>Gerado por: {user?.name}</p>
                   <p className="text-xs text-gray-500">ID: {Date.now().toString(36).toUpperCase()}</p>
                 </div>
               </div>
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-500 text-center space-y-1">
                  <p>Este documento é confidencial e destinado exclusivamente ao uso interno da organização.</p>
                  <p className="font-semibold text-gray-600">Desenvolvido por DATA OMEGA TECNOLOGIA MÓVEL LTDA.</p>
               </div>
             </div>
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Estilos de impressão */}
       <style>{`
         @media print {
           body * {
             visibility: hidden;
           }
           #print-area, #print-area * {
             visibility: visible;
           }
           #print-area {
             position: absolute;
             left: 0;
             top: 0;
             width: 100%;
             background: white !important;
             color: black !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           @page {
             margin: 20mm;
             size: A4;
           }
         }
       `}</style>
     </>
   );
 }