module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/tests/**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(scss|css)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|gif)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@tarojs/components$': '<rootDir>/src/__mocks__/@tarojs/components.js',
    '^@tarojs/taro$':       '<rootDir>/src/__mocks__/@tarojs/taro.js',
    '^../../services/api$': '<rootDir>/src/__mocks__/services/api.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__mocks__/setup.js'],
  transformIgnorePatterns: ['node_modules/(?!(@tarojs)/)'],
}
