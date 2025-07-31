module.exports = {
  parserOptions: {
    project: "./tsconfig.lint.json",
  },
  rules: {
    "compat/compat": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/consistent-type-assertions": "off",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
    "@typescript-eslint/prefer-includes": "off",
    "@typescript-eslint/prefer-string-starts-ends-with": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "unicorn/filename-case": "off",
    "max-classes-per-file": "off",
    "no-useless-escape": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "prefer-const": "warn",
  },
  overrides: [
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
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
