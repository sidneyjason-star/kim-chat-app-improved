/**
 * Configurações da aplicação Kim
 * As variáveis de ambiente devem ser definidas no arquivo .env
 */

export const APP_CONFIG = {
  // Webhook do n8n para comunicação com o agente
  N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || 
    'https://seu-webhook-padrao.com/webhook/seu-id',

  // Título da aplicação
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Kim - Assistente LLM',

  // Logo/ícone da aplicação
  APP_LOGO: import.meta.env.VITE_APP_LOGO || '/logo.png',

  // Configurações de analytics (opcional)
  ANALYTICS_ENABLED: !!import.meta.env.VITE_ANALYTICS_ENDPOINT,
  ANALYTICS_ENDPOINT: import.meta.env.VITE_ANALYTICS_ENDPOINT,
  ANALYTICS_WEBSITE_ID: import.meta.env.VITE_ANALYTICS_WEBSITE_ID,
};

// Validar webhook URL em desenvolvimento
if (import.meta.env.DEV && APP_CONFIG.N8N_WEBHOOK_URL.includes('seu-webhook-padrao')) {
  console.warn(
    '⚠️  Aviso: VITE_N8N_WEBHOOK_URL não está configurado. ' +
    'Configure a variável de ambiente antes de fazer deploy.'
  );
}

export default APP_CONFIG;

