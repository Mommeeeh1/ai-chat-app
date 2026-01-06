import { createChildLogger } from '../utils/logger';
import * as chatRepository from '../repositories/chat.repository';
import * as profileRepository from '../repositories/profile.repository';
import { chatWithOllama, buildSystemPrompt } from '../lib/ollama';
import { ChatResponseDTO, toChatMessageDTO } from '../dtos/chat.dto';
import { ServiceUnavailableError, AppError } from '../utils/errors';
import { CHAT_MESSAGES } from '../constants';
import { HttpStatus } from '../constants';

const chatLogger = createChildLogger({ module: 'chat', service: 'ChatService' });

/**
 * Chat Service
 *
 * Business logic for AI chat
 * - Manages conversation context
 * - Calls AI (Ollama)
 * - Saves messages to database
 */

/**
 * Send a message to AI trainer
 *
 * @param userId - User's ID
 * @param message - User's message
 * @returns AI response with conversation context
 */
export async function sendMessage(userId: string, message: string): Promise<ChatResponseDTO> {
  chatLogger.info(`Processing chat message for user: ${userId}`);

  try {
    // Step 1: Get user profile for personalized context
    chatLogger.debug('Fetching user profile for context...');
    const profile = await profileRepository.findProfileByUserId(userId);

    // Step 2: Get recent conversation history (last 10 messages)
    chatLogger.debug('Fetching recent conversation history...');
    const recentMessages = await chatRepository.getRecentContext(userId, 10);

    // Step 3: Build system prompt with user profile
    chatLogger.debug('Building system prompt...');
    const systemMessage = buildSystemPrompt(
      profile
        ? {
            age: profile.age || undefined,
            gender: profile.gender || undefined,
            currentWeight: profile.currentWeight || undefined,
            targetWeight: profile.targetWeight || undefined,
            primaryGoal: profile.primaryGoal || undefined,
            activityLevel: profile.activityLevel || undefined,
            dietaryRestrictions: profile.dietaryRestrictions,
            availableEquipment: profile.availableEquipment,
            workoutDaysPerWeek: profile.workoutDaysPerWeek || undefined,
          }
        : undefined
    );

    // Step 4: Build conversation context for AI
    const conversationContext = [
      systemMessage,
      ...recentMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    chatLogger.debug('Sending request to Ollama...', {
      contextLength: conversationContext.length,
      hasProfile: !!profile,
    });

    // Step 5: Get AI response
    const aiReply = await chatWithOllama(conversationContext);

    chatLogger.info('AI response received', {
      replyLength: aiReply.length,
    });

    // Step 6: Save user message to database
    chatLogger.debug('Saving user message to database...');
    const savedUserMessage = await chatRepository.saveMessage(userId, 'user', message);

    // Step 7: Save AI response to database
    chatLogger.debug('Saving AI response to database...');
    const savedAiMessage = await chatRepository.saveMessage(userId, 'assistant', aiReply);

    // Step 8: Get total conversation length
    const conversationLength = await chatRepository.getConversationCount(userId);

    chatLogger.info(`Chat completed successfully for user: ${userId}`, {
      conversationLength,
    });

    // Step 9: Return formatted response
    return {
      userMessage: toChatMessageDTO(savedUserMessage),
      aiMessage: toChatMessageDTO(savedAiMessage),
      conversationLength,
    };
  } catch (error) {
    chatLogger.error('Chat service error:', error);

    if (error instanceof Error && error.message.includes('Ollama')) {
      throw new ServiceUnavailableError('AI', CHAT_MESSAGES.AI_UNAVAILABLE);
    }

    throw new AppError('Failed to process chat message', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Get chat history for a user with pagination support
 *
 * @param userId - User's ID
 * @param limit - Max number of messages (default: 20)
 * @param cursor - Cursor for pagination (message ID to start from)
 * @returns Object with messages and nextCursor
 */
export async function getChatHistory(userId: string, limit: number = 20, cursor?: string) {
  chatLogger.info(
    `Getting chat history for user: ${userId} (limit: ${limit}, cursor: ${cursor || 'none'})`
  );

  const messages = await chatRepository.getChatHistory(userId, limit, cursor);

  // Return in chronological order (oldest first)
  const formattedMessages = messages.reverse().map(toChatMessageDTO);

  // If we got a full page of messages, there might be more
  const nextCursor =
    messages.length === limit
      ? messages[messages.length - 1]?.id // Last message ID (before reverse)
      : null;

  return {
    messages: formattedMessages,
    nextCursor,
  };
}

/**
 * Delete chat history for a user
 *
 * @param userId - User's ID
 * @returns Number of messages deleted
 */
export async function deleteChatHistory(userId: string): Promise<number> {
  chatLogger.info(`Deleting chat history for user: ${userId}`);

  const count = await chatRepository.deleteChatHistory(userId);

  chatLogger.info(`Deleted ${count} messages for user: ${userId}`);
  return count;
}
