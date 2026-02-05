// ============================================
// CONFIGURAÇÃO DA API
// ============================================
 // Configuração centralizada para conexão com API Middleware (Porta 3000)

export const API_CONFIG = {
  // URL base da API de posições dos veículos
  BASE_URL: 'http://84.46.255.106:3000',
  
   // Endpoints
   ENDPOINTS: {
     LOGIN: '/auth/login',
     VEHICLES: '/vehicles',
     POSITIONS: '/api/positions',
   },
  
  // Intervalo de atualização em milissegundos (10 segundos)
  REFRESH_INTERVAL: 10000,
  
  // Se true, usa dados mockados mesmo quando a API está disponível (para testes)
  FORCE_MOCK_DATA: false,
 
   // Socket.io habilitado
   SOCKET_ENABLED: true,
   
   // Timeout para requisições (ms)
   REQUEST_TIMEOUT: 5000,
};

 // Helper para construir URLs
 export const buildUrl = (endpoint: string) => {
   if (API_CONFIG.BASE_URL.startsWith('/') || API_CONFIG.BASE_URL === '') {
     return endpoint;
   }
   return `${API_CONFIG.BASE_URL}${endpoint}`;
};
 
 // Mantém compatibilidade com código existente
 export const getPositionsUrl = () => buildUrl(API_CONFIG.ENDPOINTS.POSITIONS);
 export const getVehiclesUrl = () => buildUrl(API_CONFIG.ENDPOINTS.VEHICLES);
 export const getLoginUrl = () => buildUrl(API_CONFIG.ENDPOINTS.LOGIN);
