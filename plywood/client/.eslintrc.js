const fs = require("fs");
const path = require("path");

function extractGlobalsFromPrefix() {
  const prefixPath = path.join(__dirname, "extra/prefix.js");
  const prefixContent = fs.readFileSync(prefixPath, "utf8");
  const varMatches = prefixContent.match(/var\s+(\w+)\s*=/g);
  const globals = {};

  if (varMatches) {
    varMatches.forEach(match => {
      const varName = match.match(/var\s+(\w+)/)[1];
      globals[varName] = "readonly";
    });
  }

  return globals;
}

module.exports = {
  parserOptions: {
    project: "./tsconfig.lint.json",
  },
  globals: extractGlobalsFromPrefix(),
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
    "no-dupe-class-members": "warn",
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
      webpack: {
        config: "webpack.config.js",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
    "react": {
      version: "detect",
    },
  },
  ignorePatterns: [
    "build/",
    "dist/",
    "node_modules/",
    "**/*.js",
    "*.js",
  ],
};
