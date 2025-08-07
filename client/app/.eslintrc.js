module.exports = {
  extends: ["../.eslintrc.js"],
  env: {
    "jest/globals": true,
  },
  globals: {
    int: "readonly",
    ClientRect: "readonly",
    JSX: "readonly",
  },
  rules: {
    "jest/no-focused-tests": "off",
  },
};
