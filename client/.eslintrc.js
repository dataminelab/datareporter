module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "react-app",
    "plugin:compat/recommended",
    "prettier",
    "plugin:jsx-a11y/recommended",
    // Remove any typescript-eslint rules that would conflict with prettier
    "prettier/@typescript-eslint",
  ],
  plugins: [
    "jest",
    "compat",
    "no-only-tests",
    "@typescript-eslint",
    "jsx-a11y",
    "cypress",
  ],
  settings: {
    "import/resolver": "webpack",
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "jsx-a11y/anchor-is-valid": [
      // TMP
      "off",
      {
        components: ["Link"],
        aspects: ["noHref", "invalidHref", "preferButton"],
      },
    ],
    "jsx-a11y/no-redundant-roles": "error",
    "jsx-a11y/no-autofocus": "off",
    "jsx-a11y/click-events-have-key-events": "off", // TMP
    "jsx-a11y/no-static-element-interactions": "off", // TMP
    "jsx-a11y/no-noninteractive-element-interactions": "off", // TMP
    "jsx-a11y/label-has-associated-control": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "antd",
            message: "Please use 'import XXX from antd/lib/XXX' import instead.",
          },
          {
            name: "antd/lib",
            message: "Please use 'import XXX from antd/lib/XXX' import instead.",
          },
        ],
      },
    ],
    "cypress/no-unnecessary-waiting": "warn",
    "@typescript-eslint/ban-ts-ignore": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
  },
  overrides: [
    {
      files: ["*.js", "*.jsx", ".*.js", ".*.jsx"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    },
    {
      // Only run typescript-eslint on TS files
      files: ["*.ts", "*.tsx", ".*.ts", ".*.tsx"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        // Do not require functions (especially react components) to have explicit returns
        "@typescript-eslint/explicit-function-return-type": "off",
        // Do not require to type every import from a JS file to speed up development
        "@typescript-eslint/no-explicit-any": "off",
        // Do not complain about useless contructors in declaration files
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        // Many API fields and generated types use camelcase
        "@typescript-eslint/camelcase": "off",
      },
    },
    {
      files: ["**/*.mocha.ts", "**/*.mocha.tsx", "**/*.test.ts", "**/*.test.tsx"],
      env: {
        mocha: true,
        jest: false,
      },
      plugins: [],
      rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-unused-expressions": "off", // allow chai-like expect().to.be.true;
        "jest/no-disabled-tests": "off",
        "jest/valid-expect": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "no-var": "warn",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/no-empty-interface": "off",
      },
    },
    {
      files: ["**/TurniloComponent/**"],
      env: {
        mocha: true,
        jest: false,
      },
      rules: {
        "@typescript-eslint/no-useless-constructor": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "no-var": "warn",
        "prefer-const": "warn",
        '@typescript-eslint/no-namespace': [
          'warn',
          { allowDeclarations: true },
        ],
        "@typescript-eslint/no-unused-expressions": "off", // allow chai-like expect().to.be.true;
        "jest/valid-expect": "off",
      },
    },
  ],
  ignorePatterns: ["**/*.min.js"],
};
