module.exports = {
  extends: ["../.eslintrc.js"],
  plugins: ["jest"],
  env: {
    "jest/globals": true,
  },
  rules: {
    "jest/no-focused-tests": "off",
  },
};
