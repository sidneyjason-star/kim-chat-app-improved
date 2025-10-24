/**
 * Utilitários para persistência de dados no navegador
 * Usa localStorage para armazenar configurações e histórico de chat
 */

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEYS = {
  USER_NAME: 'kim_user_name',
  AGENT_NAME: 'kim_agent_name',
  AGENT_PHOTO: 'kim_agent_photo',
  WEBHOOK_URL: 'kim_webhook_url',
  CHAT_HISTORY: 'kim_chat_history',
  CHAT_SESSIONS: 'kim_chat_sessions',
} as const;

/**
 * Configurações do usuário
 */
export const userStorage = {
  setName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  getName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME);
  },

  removeName(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
  },
};

/**
 * Configurações do agente
 */
export const agentStorage = {
  setName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.AGENT_NAME, name);
  },

  getName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AGENT_NAME);
  },

  setPhoto(photo: string): void {
    localStorage.setItem(STORAGE_KEYS.AGENT_PHOTO, photo);
  },

  getPhoto(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AGENT_PHOTO);
  },

  setWebhookUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url);
  },

  getWebhookUrl(): string | null {
    return localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.AGENT_NAME);
    localStorage.removeItem(STORAGE_KEYS.AGENT_PHOTO);
    localStorage.removeItem(STORAGE_KEYS.WEBHOOK_URL);
  },
};

/**
 * Histórico de chat
 */
export const chatStorage = {
  /**
   * Salva o histórico de mensagens
   */
  saveMessages(messages: Message[]): void {
    try {
      const serialized = messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Erro ao salvar histórico de chat:', error);
    }
  },

  /**
   * Carrega o histórico de mensagens
   */
  loadMessages(): Message[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Erro ao carregar histórico de chat:', error);
      return [];
    }
  },

  /**
   * Limpa o histórico de chat
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },

  /**
   * Obtém o tamanho do histórico em caracteres
   */
  getSize(): number {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return stored ? stored.length : 0;
  },
};

/**
 * Sessões de chat (múltiplas conversas)
 */
export const sessionStorage = {
  /**
   * Cria uma nova sessão
   */
  createSession(): ChatSession {
    const session: ChatSession = {
      id: Date.now().toString(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return session;
  },

  /**
   * Salva uma sessão
   */
  saveSession(session: ChatSession): void {
    try {
      const sessions = sessionStorage.loadSessions();
      const index = sessions.findIndex((s) => s.id === session.id);

      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }

      const serialized = sessions.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));

      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(serialized));
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  },

  /**
   * Carrega todas as sessões
   */
  loadSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }));
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      return [];
    }
  },

  /**
   * Carrega uma sessão específica
   */
  loadSession(id: string): ChatSession | null {
    const sessions = sessionStorage.loadSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  /**
   * Deleta uma sessão
   */
  deleteSession(id: string): void {
    try {
      const sessions = sessionStorage.loadSessions();
      const filtered = sessions.filter((s) => s.id !== id);

      const serialized = filtered.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));

      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(serialized));
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
    }
  },

  /**
   * Limpa todas as sessões
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_SESSIONS);
  },
};

/**
 * Limpa todos os dados armazenados
 */
export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

