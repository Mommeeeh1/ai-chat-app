'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatApi, profileApi } from '@/lib/api';
import type { Message, Profile } from '@/types';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  
  // REF - For auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ React Query: Infinite query for chat history with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
  } = useInfiniteQuery({
    queryKey: ['chat-history'],
    queryFn: ({ pageParam }) => chatApi.getHistory(20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // Flatten all pages into single array
  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  // ✅ React Query: Fetch profile (automatic caching)
  const { data: profile, isLoading: isProfileLoading } = useQuery<Profile | null>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        return await profileApi.get();
      } catch (err) {
        // Profile doesn't exist yet - that's okay
        return null;
      }
    },
  });

  // ✅ React Query: Mutation for sending messages with optimistic updates (infinite query compatible)
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(message),
    onMutate: async (newMessage: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat-history'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['chat-history']);

      // Optimistically add user message to the FIRST page (most recent)
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: newMessage,
        createdAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['chat-history'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            // Add to first page (most recent messages)
            if (index === 0) {
              return {
                ...page,
                messages: [...page.messages, tempUserMessage],
              };
            }
            return page;
          }),
        };
      });

      return { previousData };
    },
    onSuccess: (data: { userMessage: Message; aiMessage: Message }) => {
      // Replace temp message with real messages from backend
      queryClient.setQueryData(['chat-history'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            // Update first page (most recent messages)
            if (index === 0) {
              return {
                ...page,
                messages: [
                  ...page.messages.slice(0, -1), // Remove temp message
                  data.userMessage,
                  data.aiMessage,
                ],
              };
            }
            return page;
          }),
        };
      });
    },
    onError: (err: Error, _newMessage: string, context?: { previousData?: any }) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        queryClient.setQueryData(['chat-history'], context.previousData);
      }
      setError(err.message || 'Failed to send message');
    },
  });

  // AUTO-SCROLL to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // SEND MESSAGE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    
    sendMessageMutation.mutate(userMessage);
  };

  // Check if profile is complete
  const isProfileComplete = profile && (
    profile.age && 
    profile.primaryGoal && 
    profile.activityLevel
  );

  const isProfileLoaded = !isProfileLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Personal Trainer</h1>
            <p className="text-sm text-gray-600">Ask me anything about fitness, nutrition, or workouts!</p>
          </div>
          
          {/* Profile Status Indicator */}
          {isProfileLoaded && (
            <div className="flex items-center gap-2">
              {isProfileComplete ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600 text-sm">✓</span>
                  <span className="text-sm text-green-700 font-medium">Personalized</span>
                </div>
              ) : (
                <Link 
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                >
                  <span className="text-amber-600 text-sm">⚠</span>
                  <span className="text-sm text-amber-700 font-medium">Complete Profile</span>
                </Link>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Completion Reminder */}
        {isProfileLoaded && !isProfileComplete && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Complete your{' '}
              <Link href="/dashboard/profile" className="underline font-medium">
                fitness profile
              </Link>
              {' '}to get personalized workout and nutrition advice tailored to your goals!
            </p>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 space-y-4">
        {/* Load More Button (at top for older messages) */}
        {hasNextPage && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
            >
              {isFetchingNextPage ? 'Loading older messages...' : 'Load Older Messages'}
            </button>
          </div>
        )}

        {isLoadingMessages ? (
          // Loading state for initial fetch
          <div className="flex justify-center py-12">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Fitness Journey!
            </h3>
            <p className="text-gray-600 mb-4">
              Ask me anything about workouts, nutrition, or fitness goals.
            </p>
            {isProfileLoaded && !isProfileComplete && (
              <Link
                href="/dashboard/profile"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Complete Your Profile for Personalized Advice →
              </Link>
            )}
            {isProfileComplete && (
              <p className="text-sm text-green-600 mt-4">
                ✓ Your profile is complete! I'll give you personalized advice.
              </p>
            )}
          </div>
        ) : (
          // Messages
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Submit on Enter (but Shift+Enter adds new line)
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about workouts, nutrition, or fitness goals..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
            rows={2}
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

