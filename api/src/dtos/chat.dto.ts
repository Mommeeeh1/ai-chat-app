import { z } from 'zod';

/**
 * Chat DTOs
 *
 * Data Transfer Objects for AI chat operations
 */

/**
 * Chat message from database
 */
interface ChatMessage {
  id: string;
  userId: string;
  role: string;
  content: string;
  metadata: string | null;
  createdAt: Date;
}

/**
 * Zod Schema for sending a chat message
 */
export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long (max 1000 characters)'),
});

/**
 * TypeScript type for send message request
 */
export type SendMessageDTO = z.infer<typeof sendMessageSchema>;

/**
 * Zod Schema for chat message response
 */
export const chatMessageResponseSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  createdAt: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()),
});

/**
 * TypeScript type for chat message response
 */
export type ChatMessageResponseDTO = z.infer<typeof chatMessageResponseSchema>;

/**
 * Zod Schema for chat response (includes AI reply)
 */
export const chatResponseSchema = z.object({
  userMessage: chatMessageResponseSchema,
  aiMessage: chatMessageResponseSchema,
  conversationLength: z.number(),
});

/**
 * TypeScript type for chat response
 */
export type ChatResponseDTO = z.infer<typeof chatResponseSchema>;

/**
 * Transform database ChatMessage to ChatMessageResponseDTO
 */
export function toChatMessageDTO(message: ChatMessage): ChatMessageResponseDTO {
  return chatMessageResponseSchema.parse({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
  });
}
