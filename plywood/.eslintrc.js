module.exports = {
  root: true,
  extends: [
    "../client/.eslintrc.js"
  ],
  overrides: [
    {
      files: ["docs/**/*.js", "data/**/*.js"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "script"
      },
      env: {
        node: true,
        commonjs: true
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "no-undef": "off",
        "@typescript-eslint/no-require-imports": "off"
      }
    }
  ],
  ignorePatterns: ["**/*.min.js"],
};
