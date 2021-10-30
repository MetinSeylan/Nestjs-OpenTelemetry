module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [`**/Tests/*.+(ts|js)`],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'node',
};
