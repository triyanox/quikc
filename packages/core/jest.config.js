module.exports = {
  preset: 'ts-jest',
  verbose: true,
  silent: true,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|js|tsx)'],
  moduleNameMapper: {
    '^@quikc/(.*)$': '<rootDir>/../../packages/$1/lib'
  },
  collectCoverageFrom: ['src/**/*.{ts,js,tsx}', '!src/**/*.d.{ts,js,tsx}'],
  coverageReporters: ['json', 'lcov', 'text', 'clover']
};
