module.exports = {
  root: true,
  extends: [require.resolve("../client/.eslintrc.js")],
  rules: {
    "@typescript-eslint/no-this-alias": "warn",
    "@typescript-eslint/no-unused-expressions": "warn",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
    "@typescript-eslint/prefer-includes": "off",
    "@typescript-eslint/prefer-string-starts-ends-with": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "unicorn/filename-case": "off",
    "max-classes-per-file": "off",
    "no-useless-escape": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/ban-ts-comment": "warn",
  },
  overrides: [
    {
      files: ["docs/**/*.js", "data/**/*.js"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "script",
      },
      env: {
        node: true,
        commonjs: true,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "no-undef": "off",
        "@typescript-eslint/no-require-imports": "off",
      },
    },
    {
      files: ["test/**/*.js"],
      env: {
        node: true,
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "unused-imports/no-unused-vars": "off",
      },
    },
  ],
  ignorePatterns: ["**/*.min.js"],
};
