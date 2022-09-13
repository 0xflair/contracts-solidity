module.exports = {
  trailingComma: 'all',
  singleQuote: true,
  semi: true,
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: false,
  arrowParens: 'always',
  overrides: [
    {
      files: '*.sol',
      options: {
        printWidth: 120,
        tabWidth: 4,
        singleQuote: false,
        bracketSpacing: false,
        explicitTypes: 'always',
      },
    },
  ],
};
