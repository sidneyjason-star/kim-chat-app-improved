import { z } from 'zod';

/**
 * Schemas de validação para o aplicativo Kim
 */

// Validação de URL
const urlSchema = z.string().url('URL inválida').trim();

// Validação de webhook do n8n
export const webhookConfigSchema = z.object({
  url: urlSchema.refine(
    (url) => url.includes('webhook'),
    'URL deve ser um webhook válido'
  ),
  name: z.string().min(1, 'Nome obrigatório').max(50, 'Nome muito longo'),
  photo: z.string().url('URL de foto inválida').optional().or(z.literal('')),
});

export type WebhookConfig = z.infer<typeof webhookConfigSchema>;

// Validação de mensagem
export const messageSchema = z.object({
  id: z.string(),
  type: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Mensagem não pode estar vazia'),
  timestamp: z.date(),
});

export type Message = z.infer<typeof messageSchema>;

// Validação de configuração do usuário
export const userConfigSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50, 'Nome muito longo'),
  agentName: z.string().min(1, 'Nome do agente obrigatório').max(50),
  agentPhoto: z.string().url('URL de foto inválida').optional().or(z.literal('')),
  webhookUrl: urlSchema,
});

export type UserConfig = z.infer<typeof userConfigSchema>;

/**
 * Função auxiliar para validar e retornar erros amigáveis
 */
export const validateWebhookConfig = (
  data: unknown
): { success: boolean; data?: WebhookConfig; error?: string } => {
  const result = webhookConfigSchema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.errors[0];
    return {
      success: false,
      error: firstError.message,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

export const validateUserConfig = (
  data: unknown
): { success: boolean; data?: UserConfig; error?: string } => {
  const result = userConfigSchema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.errors[0];
    return {
      success: false,
      error: firstError.message,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

