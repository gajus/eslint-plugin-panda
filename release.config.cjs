module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'plugin',
      },
    ],
    '@semantic-release/github',
  ],
  // eslint-disable-next-line no-template-curly-in-string
  tagFormat: 'eslint-plugin-panda@${version}',
};
