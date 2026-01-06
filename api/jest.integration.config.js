/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest to handle TypeScript files
  preset: 'ts-jest',

  // Run tests in Node.js environment
  testEnvironment: 'node',

  // Only run integration tests
  testMatch: ['**/src/__tests__/integration/**/*.test.ts'],

  // Folders to ignore
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Show individual test results
  verbose: true,

  // Clear mock data between tests
  clearMocks: true,

  // Set timeout for integration tests (they may take longer)
  testTimeout: 30000,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/test-server.ts'],

  // Run tests sequentially to avoid database conflicts
  maxWorkers: 1,
};



