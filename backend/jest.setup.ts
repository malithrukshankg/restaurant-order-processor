// jest.setup.ts
const originalError = console.error;

beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = args[0];
    
    // Suppress expected error messages from tests
    const suppressedMessages = [
      'Register error:',
      'Login error:',
      'Error loading menu:',
      'Error creating order:',
    ];

    const shouldSuppress = suppressedMessages.some(msg => 
      typeof message === 'string' && message.includes(msg)
    );

    if (!shouldSuppress) {
      originalError(...args);
    }
  };
});

afterAll(() => {
  console.error = originalError;
});

// Ensure Jest globals are available
global.jest = jest;