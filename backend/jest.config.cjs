module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    ],
  },
  
  testMatch: ['**/tests/**/*.test.ts'],
  
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], ← REMOVE THIS
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/server.ts',
    '!src/seed.ts',
  ],
  
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  silent: true,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};