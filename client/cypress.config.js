const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5000",
    defaultCommandTimeout: 20000,
    downloadsFolder: "cypress/downloads",
    fixturesFolder: "cypress/fixtures",
    requestTimeout: 15000,
    screenshotsFolder: "cypress/screenshots",
    specPattern: "cypress/integration/",
    supportFile: "cypress/support/index.js",
    video: true,
    videoUploadOnPasses: false,
    videosFolder: "cypress/videos",
    viewportHeight: 1024,
    viewportWidth: 1280,
    env: {
      coverage: false,
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
