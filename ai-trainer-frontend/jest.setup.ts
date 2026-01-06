// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Create mock functions outside so they can be accessed
const mockLogin = jest.fn();
const mockLogout = jest.fn();

// Mock auth context to prevent async calls in tests
jest.mock('./contexts/auth-context', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  
  return {
    AuthContext: React.createContext({
      user: null,
      login: mockLogin,
      logout: mockLogout,
      isLoading: false,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => {
      // Return children directly - no async calls, no state updates
      return React.createElement(React.Fragment, null, children);
    },
    useAuth: () => ({
      user: null,
      login: mockLogin,
      logout: mockLogout,
      isLoading: false,
    }),
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  redirect: jest.fn(),
}))

// Mock fetch globally - return successful response by default
// This prevents AuthProvider from making real API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false, // Return false so auth check doesn't set user
    status: 401,
    json: async () => ({ error: 'Unauthorized' }),
    text: async () => '',
  } as Response)
) as jest.Mock;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(() => null),
};
global.localStorage = localStorageMock as Storage;

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = jest.fn();

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
  mockLogin.mockClear();
  mockLogout.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  (global.fetch as jest.Mock).mockClear();
})



