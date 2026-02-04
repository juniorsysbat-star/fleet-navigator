// ============================================
// CONFIGURAÇÃO DA API
// ============================================
// Altere a URL abaixo para apontar para seu servidor
// Quando hospedado no mesmo servidor, use apenas o caminho relativo: '/api/positions'

export const API_CONFIG = {
  // URL base da API de posições dos veículos
  BASE_URL: 'http://84.46.255.106:3000',
  
  // Endpoint de posições
  POSITIONS_ENDPOINT: '/api/positions',
  
  // Intervalo de atualização em milissegundos (10 segundos)
  REFRESH_INTERVAL: 10000,
  
  // Se true, usa dados mockados mesmo quando a API está disponível (para testes)
  FORCE_MOCK_DATA: false,
};

// URL completa da API
export const getPositionsUrl = () => {
  // Se estiver no mesmo domínio do servidor, use caminho relativo
  if (API_CONFIG.BASE_URL.startsWith('/') || API_CONFIG.BASE_URL === '') {
    return API_CONFIG.POSITIONS_ENDPOINT;
  }
  return `${API_CONFIG.BASE_URL}${API_CONFIG.POSITIONS_ENDPOINT}`;
};
