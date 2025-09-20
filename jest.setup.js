// Global test setup
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock environment variables for tests
process.env.NODE_ENV = 'test';

// Set default test environment variables
process.env.CODEGUIDE_API_URL = 'https://api.codeguide.app';
process.env.CODEGUIDE_API_VERSION = 'v1';