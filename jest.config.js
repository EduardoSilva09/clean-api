module.exports = {
  coverageDirectory: 'coverage',
  testEnvioroment: 'node',
  collectCoverageFrom: ['**/src/**/*.js', '!**/src/main/**'],
  preset: '@shelf/jest-mongodb'
}
