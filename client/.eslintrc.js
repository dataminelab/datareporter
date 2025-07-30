module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    }
  },
  extends: [
    "react-app",
    "prettier",
    "plugin:compat/recommended",
    'plugin:@typescript-eslint/recommended',
    "plugin:jsx-a11y/recommended",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime", // This tells ESLint about the new JSX transform
  ],
  plugins: [
    "jest",
    "compat",
    "no-only-tests",
    "@typescript-eslint",
    "jsx-a11y",
    "cypress",
    "react",
  ],
  settings: {
    "import/resolver": "webpack",
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    "no-empty": ["warn", { "allowEmptyCatch": true }],
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
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-use-before-define": "warn",
    "@typescript-eslint/ban-types": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "warn",
    "react/react-in-jsx-scope": "off", // Disable the rule requiring React import
    "no-unused-vars": ["warn", {
      varsIgnorePattern: "^React$",
      argsIgnorePattern: "^_"
    }],
    "@typescript-eslint/no-unused-vars": ["warn", {
      varsIgnorePattern: "^React$",
      argsIgnorePattern: "^_"
    }],
    "react/prop-types": "off", // Disable prop-types as we use TypeScript
  },
  overrides: [
    {
      // cypress tests
      files: ["cypress/**/*.js", "cypress/**/*.ts", "cypress.config.js"],
      rules: {
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "cypress/no-assigning-return-values": "off",
        "cypress/unsafe-to-chain-command": "off",
        "cypress/no-unnecessary-waiting": "warn",
        "@typescript-eslint/no-empty-function": "off",
        "no-unused-vars": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
      }

    },
    {
      files: ["**/*.js", "**/*.jsx"],
      plugins: ["react"],
      extends: ["eslint:recommended", "plugin:react/recommended"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react/prop-types": "warn",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    },
    {
      files: ["**/*.mocha.ts", "**/*.mocha.tsx", "**/*.test.ts", "**/*.test.tsx"],
      parser: null,
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
        "no-var": "warn",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/no-empty-interface": "off",
      },
    },
    {
      files: ["**/TurniloComponent/**/*.{js,jsx,ts,tsx}"],
      rules: {
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/no-empty-interface": "off",
        "no-var": "warn",
        "prefer-const": "warn",
        '@typescript-eslint/no-namespace': [
          'warn',
          { allowDeclarations: true },
        ],
        "@typescript-eslint/no-unused-expressions": "off", // allow chai-like expect().to.be.true;
        "jest/valid-expect": "off",
        'getter-return': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        "@typescript-eslint/explicit-module-boundary-types": "warn",
        "jest/no-done-callback": "off",
      },
    },
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "react/prop-types": "off",
      },
    },
  ],
  ignorePatterns: ["**/*.min.js"],
};
