module.exports = {
  extends: ["plugin:cypress/recommended"],
  plugins: ["cypress", "chai-friendly"],
  env: {
    "cypress/globals": true,
  },
  rules: {
    "func-names": ["error", "never"],
    "chai-friendly/no-unused-expressions": "error",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "cypress/no-assigning-return-values": "off",
    "cypress/unsafe-to-chain-command": "warn",
    "cypress/no-unnecessary-waiting": "warn",
    "@typescript-eslint/no-empty-function": "off",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
  },
};
