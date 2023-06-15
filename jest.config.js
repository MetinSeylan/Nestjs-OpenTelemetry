module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      lines: 91,
    },
  },
};
