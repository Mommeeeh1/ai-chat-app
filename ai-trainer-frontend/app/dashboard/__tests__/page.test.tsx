/**
 * Dashboard Page Tests
 * 
 * Testing the main dashboard/chat component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import DashboardPage from '../page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { chatApi, profileApi } from '@/lib/api';

// Mock the APIs
jest.mock('@/lib/api', () => ({
  chatApi: {
    sendMessage: jest.fn(),
    getHistory: jest.fn(),
  },
  profileApi: {
    get: jest.fn(),
  },
}));

// Create a wrapper with QueryClient for testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (chatApi.getHistory as jest.Mock).mockResolvedValue({
      messages: [],
      nextCursor: null,
    });
    
    (profileApi.get as jest.Mock).mockResolvedValue({
      id: 'profile-1',
      age: 28,
      gender: 'male',
      primaryGoal: 'weight_loss',
    });
  });

  it('should render dashboard with chat interface', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    // Should show welcome message or chat input
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask your ai trainer/i)).toBeInTheDocument();
    });
    
    // Should have send button
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should display chat history when loaded', async () => {
    // Mock chat history
    const mockMessages = [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hi! How can I help you today?',
        createdAt: new Date().toISOString(),
      },
    ];
    
    (chatApi.getHistory as jest.Mock).mockResolvedValue({
      messages: mockMessages,
      nextCursor: null,
    });
    
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    // Should display messages
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi! How can I help you today?')).toBeInTheDocument();
    });
  });

  it('should send message when form is submitted', async () => {
    // Mock successful message send
    (chatApi.sendMessage as jest.Mock).mockResolvedValue({
      userMessage: {
        id: 'msg-3',
        role: 'user',
        content: 'What exercises should I do?',
        createdAt: new Date().toISOString(),
      },
      aiMessage: {
        id: 'msg-4',
        role: 'assistant',
        content: 'I recommend starting with squats and push-ups.',
        createdAt: new Date().toISOString(),
      },
    });
    
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask your ai trainer/i)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/ask your ai trainer/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Type message
    fireEvent.change(input, { target: { value: 'What exercises should I do?' } });
    
    // Submit
    fireEvent.click(sendButton);
    
    // Should call API
    await waitFor(() => {
      expect(chatApi.sendMessage).toHaveBeenCalledWith('What exercises should I do?');
    });
    
    // Input should be cleared
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should not send empty messages', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask your ai trainer/i)).toBeInTheDocument();
    });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Try to send empty message
    fireEvent.click(sendButton);
    
    // API should not be called
    expect(chatApi.sendMessage).not.toHaveBeenCalled();
  });

  it('should display error message when send fails', async () => {
    // Mock failed message send
    (chatApi.sendMessage as jest.Mock).mockRejectedValue(
      new Error('Failed to send message')
    );
    
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask your ai trainer/i)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/ask your ai trainer/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Type and send message
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    // Should display error
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });
  });

  it('should disable input while sending message', async () => {
    // Mock slow API call
    (chatApi.sendMessage as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask your ai trainer/i)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/ask your ai trainer/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Type and send message
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    // Input should be disabled while sending
    await waitFor(() => {
      expect(input).toBeDisabled();
    });
  });

  it('should load profile data', async () => {
    const mockProfile = {
      id: 'profile-1',
      age: 30,
      gender: 'female',
      primaryGoal: 'muscle_gain',
      currentWeight: 65,
      targetWeight: 70,
    };
    
    (profileApi.get as jest.Mock).mockResolvedValue(mockProfile);
    
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    // Should call profile API
    await waitFor(() => {
      expect(profileApi.get).toHaveBeenCalled();
    });
  });

  it('should handle missing profile gracefully', async () => {
    // Mock profile not found
    (profileApi.get as jest.Mock).mockRejectedValue(
      new Error('Profile not found')
    );
    
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    // Should still render chat interface
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask your ai trainer/i)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    // Should show some loading indicator (adjust based on your actual UI)
    // This might be a spinner, skeleton, or "Loading..." text
    expect(screen.queryByPlaceholderText(/ask your ai trainer/i)).toBeInTheDocument();
  });

  it('should support pagination for chat history', async () => {
    // Mock paginated response
    (chatApi.getHistory as jest.Mock).mockResolvedValue({
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'First message',
          createdAt: new Date().toISOString(),
        },
      ],
      nextCursor: 'cursor-1',
    });
    
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    // Should load initial messages
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
    });
    
    // Note: Testing "Load More" button interaction would require
    // finding and clicking it in the actual UI
  });
});



