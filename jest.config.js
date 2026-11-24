// Utility tests run in Node; native storage is mocked in the storage suite.
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', {
      babelrc: false,
      configFile: false,
      presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
    }],
  },
};
