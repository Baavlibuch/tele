// Set default timeout for all tests
jest.setTimeout(60000);

// Global test configurations
beforeAll(async () => {
  // Any setup that needs to run before all tests
});

afterAll(async () => {
  // Any cleanup that needs to run after all tests
});

// Global test configurations for each test
beforeEach(async () => {
  // Reset mocks and test state before each test
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clean up after each test
});
