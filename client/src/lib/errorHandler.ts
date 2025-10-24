/**
 * Sistema de tratamento de erros para o aplicativo Kim
 */

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'INVALID_RESPONSE'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export class ChatError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

/**
 * Mapeia códigos de erro para mensagens amigáveis em português
 */
const errorMessages: Record<ErrorCode, string> = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  TIMEOUT_ERROR: 'A requisição demorou muito tempo. Tente novamente.',
  INVALID_RESPONSE: 'Resposta inválida do servidor. Tente novamente.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique as configurações.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
};

/**
 * Retorna uma mensagem amigável baseada no tipo de erro
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ChatError) {
    return errorMessages[error.code];
  }

  if (error instanceof TypeError) {
    // Erro de rede (fetch falhou)
    if (error.message.includes('fetch')) {
      return errorMessages.NETWORK_ERROR;
    }
  }

  if (error instanceof Error) {
    // Timeout
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return errorMessages.TIMEOUT_ERROR;
    }

    // Erro de validação
    if (error.message.includes('validation') || error.message.includes('Validation')) {
      return errorMessages.VALIDATION_ERROR;
    }
  }

  return errorMessages.UNKNOWN_ERROR;
};

/**
 * Classifica um erro HTTP e retorna um ChatError apropriado
 */
export const classifyHttpError = (status: number, message: string): ChatError => {
  if (status >= 500) {
    return new ChatError('SERVER_ERROR', 'Erro no servidor');
  }

  if (status === 408 || status === 504) {
    return new ChatError('TIMEOUT_ERROR', 'Tempo limite excedido');
  }

  if (status === 400 || status === 422) {
    return new ChatError('VALIDATION_ERROR', 'Dados inválidos');
  }

  return new ChatError('SERVER_ERROR', `Erro HTTP ${status}`);
};

/**
 * Wrapper para requisições com timeout automático
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ChatError('TIMEOUT_ERROR', 'Requisição expirou');
      }

      if (error.message.includes('Failed to fetch')) {
        throw new ChatError('NETWORK_ERROR', 'Erro de conexão');
      }
    }

    throw new ChatError('UNKNOWN_ERROR', 'Erro ao fazer requisição');
  }
};

