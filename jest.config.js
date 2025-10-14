module.exports = {
  // Test environment - use the version compatible with Jest 24
  testEnvironment: 'jest-environment-jsdom-fourteen',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/client/app/__tests__/setupTests.js'],

  // Module paths
  roots: [
    '<rootDir>/client',
  ],

  // File patterns
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.(test|spec).{js,jsx,ts,tsx}'
  ],

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/app/$1',
    '^@components/(.*)$': '<rootDir>/client/app/components/$1',
    '^@lib/(.*)$': '<rootDir>/client/lib/$1',
    '^@services/(.*)$': '<rootDir>/client/app/services/$1',
    '^@utils/(.*)$': '<rootDir>/client/app/utils/$1',
    // Handle CSS and static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/client/app/__tests__/__mocks__/fileMock.js'
  },

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/client/cypress/',
    '<rootDir>/client/dist/',
    '<rootDir>/client/build/'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'client/app/**/*.{js,jsx}',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/node_modules/**',
    '!**/cypress/**'
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Maximum worker processes
  maxWorkers: '50%',

  // Add this for Jest 24 compatibility
  testURL: 'http://localhost',

  // Handle moment.js warnings
  globals: {
    'console.warn': jest.fn()
  }
};