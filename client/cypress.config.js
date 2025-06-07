const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5000",
    defaultCommandTimeout: 20000,
    downloadsFolder: "client/cypress/downloads",
    fixturesFolder: "client/cypress/fixtures",
    requestTimeout: 15000,
    screenshotsFolder: "client/cypress/screenshots",
    specPattern: "client/cypress/integration/",
    supportFile: "client/cypress/support/index.js",
    video: true,
    videoUploadOnPasses: false,
    videosFolder: "client/cypress/videos",
    viewportHeight: 1024,
    viewportWidth: 1280,
    env: {
      coverage: false,
    },
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome' || browser.name === 'chromium') {
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-dev-shm-usage')
        }
        return launchOptions
      })
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
