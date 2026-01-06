/**
 * Chat Service Tests
 *
 * Testing the chat service functions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getChatHistory, deleteChatHistory } from '../chat.service';

// Mock the chat repository (we don't want to hit the real database)
jest.mock('../../repositories/chat.repository');
import * as chatRepository from '../../repositories/chat.repository';

/**
 * Testing Get Chat History
 *
 * This function fetches messages and transforms them
 */
describe('ChatService - Get Chat History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return chat history in chronological order', async () => {
    // Given: We have a userId
    const userId = 'test-user-id';

    // And: The repository returns messages (in reverse chronological order)
    const mockGetChatHistory = chatRepository.getChatHistory as jest.MockedFunction<
      typeof chatRepository.getChatHistory
    >;
    mockGetChatHistory.mockResolvedValue([
      // Database returns newest first
      {
        id: '550e8400-e29b-41d4-a716-446655440003', // Valid UUID
        userId: userId,
        role: 'assistant',
        content: 'Third message',
        metadata: null,
        createdAt: new Date('2024-01-03'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002', // Valid UUID
        userId: userId,
        role: 'user',
        content: 'Second message',
        metadata: null,
        createdAt: new Date('2024-01-02'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001', // Valid UUID
        userId: userId,
        role: 'assistant',
        content: 'First message',
        metadata: null,
        createdAt: new Date('2024-01-01'),
      },
    ]);

    // When: We get chat history
    const result = await getChatHistory(userId);

    // Then: Messages should be returned
    expect(result).toBeDefined();
    expect(result.messages).toHaveLength(3);

    // And: Messages should be in chronological order (oldest first)
    expect(result.messages[0]!.content).toBe('First message');
    expect(result.messages[1]!.content).toBe('Second message');
    expect(result.messages[2]!.content).toBe('Third message');

    // And: The repository was called with correct parameters
    expect(mockGetChatHistory).toHaveBeenCalledWith(userId, 20, undefined); // default limit
  });

  it('should respect the limit parameter', async () => {
    // Given: We want only 10 messages
    const userId = 'test-user-id';
    const limit = 10;

    // And: Repository is mocked
    const mockGetChatHistory = chatRepository.getChatHistory as jest.MockedFunction<
      typeof chatRepository.getChatHistory
    >;
    mockGetChatHistory.mockResolvedValue([]);

    // When: We get chat history with a limit
    await getChatHistory(userId, limit);

    // Then: Repository should be called with that limit
    expect(mockGetChatHistory).toHaveBeenCalledWith(userId, limit, undefined);
  });

  it('should return empty array when no messages', async () => {
    // Given: User has no chat history
    const userId = 'new-user-id';

    // And: Repository returns empty array
    const mockGetChatHistory = chatRepository.getChatHistory as jest.MockedFunction<
      typeof chatRepository.getChatHistory
    >;
    mockGetChatHistory.mockResolvedValue([]);

    // When: We get chat history
    const result = await getChatHistory(userId);

    // Then: Should return empty result
    expect(result.messages).toEqual([]);
    expect(result.messages).toHaveLength(0);
  });
});

/**
 * Testing Delete Chat History
 *
 * This function deletes all chat history for a user
 */
describe('ChatService - Delete Chat History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete chat history and return count', async () => {
    // Given: We have a userId
    const userId = 'test-user-id';

    // And: Repository returns deletion count
    const mockDeleteChatHistory = chatRepository.deleteChatHistory as jest.MockedFunction<
      typeof chatRepository.deleteChatHistory
    >;
    mockDeleteChatHistory.mockResolvedValue(15); // 15 messages deleted

    // When: We delete chat history
    const result = await deleteChatHistory(userId);

    // Then: Should return the count
    expect(result).toBe(15);

    // And: Repository should have been called with userId
    expect(mockDeleteChatHistory).toHaveBeenCalledWith(userId);
    expect(mockDeleteChatHistory).toHaveBeenCalledTimes(1);
  });

  it('should return 0 when no messages to delete', async () => {
    // Given: User has no chat history
    const userId = 'empty-user-id';

    // And: Repository returns 0 (nothing deleted)
    const mockDeleteChatHistory = chatRepository.deleteChatHistory as jest.MockedFunction<
      typeof chatRepository.deleteChatHistory
    >;
    mockDeleteChatHistory.mockResolvedValue(0);

    // When: We delete chat history
    const result = await deleteChatHistory(userId);

    // Then: Should return 0
    expect(result).toBe(0);
  });
});
