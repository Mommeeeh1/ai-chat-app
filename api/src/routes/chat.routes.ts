import { Router, Response } from 'express';
import * as chatService from '../services/chat.service';
import { createChildLogger } from '../utils/logger';
import { asyncHandler, validateBody, authenticate, AuthenticatedRequest } from '../middleware';
import { sendMessageSchema, ChatResponseDTO } from '../dtos/chat.dto';
import rateLimit from 'express-rate-limit';
import { HttpStatus, CHAT_MESSAGES, ErrorCode } from '../constants';

const router = Router();

// LAZY INITIALIZATION: Create logger only when first needed
let routeLogger: ReturnType<typeof createChildLogger>;
function getLogger() {
  if (!routeLogger) {
    routeLogger = createChildLogger({ module: 'routes', service: 'ChatRoutes' });
  }
  return routeLogger;
}

/**
 * AI Chat Rate Limiter
 *
 * Stricter than general API limit because AI is resource-intensive
 *
 * Limits:
 * - 10 messages per hour per user
 *
 * Why?
 * - AI responses take time (5-10 seconds)
 * - Prevents abuse
 * - Ensures fair usage
 */
const chatRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 messages per hour
  message: (req: any, res: any) => {
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({
      error: 'Too many chat messages',
      message: CHAT_MESSAGES.RATE_LIMIT,
      errorCode: ErrorCode.RATE_LIMIT_EXCEEDED,
      retryAfter: Math.ceil(
        (req.rateLimit?.resetTime?.getTime() || Date.now() - Date.now()) / 1000
      ),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/',
  authenticate, // ← Protected: requires JWT token
  chatRateLimiter, // ← Rate limit: 10 per hour
  validateBody(sendMessageSchema), // Validate message
  asyncHandler(async (req: AuthenticatedRequest, res: Response<ChatResponseDTO>) => {
    getLogger().info('Chat message received');

    const userId = req.user!.userId;
    const { message } = req.body;

    getLogger().debug(`Processing chat for user: ${userId}`);
    const response = await chatService.sendMessage(userId, message);

    getLogger().info(`Chat response sent to user: ${userId}`);
    res.status(HttpStatus.OK).json(response);
  })
);

router.get(
  '/history',
  authenticate, // ← Protected: requires JWT token
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    getLogger().info('Get chat history request received');

    const userId = req.user!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50
    const cursor = req.query.cursor as string | undefined;

    getLogger().debug(
      `Fetching history for user: ${userId} (limit: ${limit}, cursor: ${cursor || 'none'})`
    );
    const result = await chatService.getChatHistory(userId, limit, cursor);

    getLogger().info(
      `Chat history sent to user: ${userId} (count: ${result.messages.length}, hasMore: ${!!result.nextCursor})`
    );
    res.status(HttpStatus.OK).json(result);
  })
);

router.delete(
  '/history',
  authenticate, // ← Protected: requires JWT token
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    getLogger().info('Delete chat history request received');

    const userId = req.user!.userId;

    getLogger().debug(`Deleting history for user: ${userId}`);
    const deletedCount = await chatService.deleteChatHistory(userId);

    getLogger().info(`Chat history deleted for user: ${userId} (count: ${deletedCount})`);
    res.status(HttpStatus.OK).json({
      message: CHAT_MESSAGES.HISTORY_DELETED,
      deletedCount,
    });
  })
);

export default router;
