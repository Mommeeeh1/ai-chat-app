import { prisma } from '../lib/prisma';
import { createChildLogger } from '../utils/logger';

const repoLogger = createChildLogger({ module: 'repository', service: 'ChatRepository' });

/**
 * Chat Repository
 *
 * Handles all database operations for ChatMessage model
 * Stores conversation history for context
 */

/**
 * Save a chat message to database
 *
 * @param userId - User's ID
 * @param role - Message role (user, assistant, system)
 * @param content - Message content
 * @param metadata - Optional metadata (JSON string)
 * @returns Created ChatMessage
 */
export async function saveMessage(
  userId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
) {
  repoLogger.debug(`Saving ${role} message for user: ${userId}`);

  return prisma.chatMessage.create({
    data: {
      userId,
      role,
      content,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/**
 * Get chat history for a user with pagination support
 *
 * @param userId - User's ID
 * @param limit - Max number of messages to retrieve (default: 20)
 * @param cursor - Cursor for pagination (message ID to start from)
 * @returns Array of ChatMessages
 */
export async function getChatHistory(userId: string, limit: number = 20, cursor?: string) {
  repoLogger.debug(
    `Getting chat history for user: ${userId} (limit: ${limit}, cursor: ${cursor || 'none'})`
  );

  return prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && {
      skip: 1, // Skip the cursor itself
      cursor: { id: cursor },
    }),
  });
}

/**
 * Get recent chat context for AI
 *
 * Returns last N messages to provide context to AI
 * Excludes system messages
 *
 * @param userId - User's ID
 * @param limit - Number of messages (default: 10)
 * @returns Array of ChatMessages (oldest first)
 */
export async function getRecentContext(userId: string, limit: number = 10) {
  repoLogger.debug(`Getting recent context for user: ${userId} (limit: ${limit})`);

  const messages = await prisma.chatMessage.findMany({
    where: {
      userId,
      role: {
        not: 'system', // Exclude system messages from context
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Return in chronological order (oldest first)
  return messages.reverse();
}

/**
 * Delete all chat history for a user
 *
 * @param userId - User's ID
 * @returns Number of messages deleted
 */
export async function deleteChatHistory(userId: string) {
  repoLogger.debug(`Deleting chat history for user: ${userId}`);

  const result = await prisma.chatMessage.deleteMany({
    where: { userId },
  });

  repoLogger.info(`Deleted ${result.count} messages for user: ${userId}`);
  return result.count;
}

/**
 * Get conversation count for a user
 *
 * @param userId - User's ID
 * @returns Total number of messages
 */
export async function getConversationCount(userId: string): Promise<number> {
  return prisma.chatMessage.count({
    where: { userId },
  });
}
