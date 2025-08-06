module.exports = {
  extends: [
    "../.eslintrc.js", // relative path to parent config
    "plugin:jest/recommended"
  ],
  plugins: ["jest"],
  env: {
    "jest/globals": true,
  },
  rules: {
    "jest/no-focused-tests": "off",
  },
};
