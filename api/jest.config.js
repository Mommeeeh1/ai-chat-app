/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest to handle TypeScript files
  preset: 'ts-jest',
  
  // Run tests in Node.js environment (not browser)
  testEnvironment: 'node',
  
  // Where to find our test files
  // Look for files like: auth.service.test.ts
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  
  // Folders to ignore when looking for tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Code coverage settings
  collectCoverageFrom: [
    'src/**/*.ts',           // Test all .ts files in src/
    '!src/**/*.dto.ts',      // Except DTOs (just types)
    '!src/**/*.interface.ts', // Except interfaces
    '!src/server.ts',        // Except main entry file
    '!src/**/*.d.ts'         // Except type definitions
  ],
  
  // Coverage thresholds (we'll start low and improve)
  coverageThreshold: {
    global: {
      branches: 50,    // 50% of if/else paths tested
      functions: 50,   // 50% of functions tested
      lines: 50,       // 50% of lines tested
      statements: 50   // 50% of statements tested
    }
  },
  
  // Show individual test results
  verbose: true,
  
  // Clear mock data between tests
  clearMocks: true,
};

