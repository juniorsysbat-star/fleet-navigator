// ============================================
// CONFIGURAÇÃO DA API (Conexão Direta Traccar)
// ============================================

export const API_CONFIG = {
  // Conecta diretamente ao IP da VPS na porta padrão (80) onde o Traccar está respondendo
  // Nota: O Traccar usa Basic Auth ou Cookies de Sessão, não JWT customizado
  BASE_URL: "http://84.46.255.106",

  // Endpoints Oficiais da API Traccar (Documentação: traccar.org/api-reference)
  ENDPOINTS: {
    LOGIN: "/api/session", // POST para login (email/password form-encoded)
    VEHICLES: "/api/devices", // GET para lista de dispositivos
    POSITIONS: "/api/positions", // GET para posições recentes
    SOCKET: "/api/socket", // WebSocket endpoint
  },

  // Intervalo de atualização (mantive 10s para não sobrecarregar)
  REFRESH_INTERVAL: 10000,

  // Desativar mocks para forçar uso do servidor real
  FORCE_MOCK_DATA: false,

  // O Traccar usa WebSocket nativo
  SOCKET_ENABLED: true,

  // Timeout
  REQUEST_TIMEOUT: 10000,
};

// Helper simples para construir URLs
export const buildUrl = (endpoint: string) => {
  // Remove barra final da Base URL se existir para evitar duplicidade
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, "");
  // Garante que o endpoint comece com barra
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

// Exports de compatibilidade
export const getPositionsUrl = () => buildUrl(API_CONFIG.ENDPOINTS.POSITIONS);
export const getVehiclesUrl = () => buildUrl(API_CONFIG.ENDPOINTS.VEHICLES);
export const getLoginUrl = () => buildUrl(API_CONFIG.ENDPOINTS.LOGIN);
