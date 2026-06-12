const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'noxtvj',
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  screenshotOnRunFailure: true,
  video: false,

  env: {
    apiUrl: "http://localhost:5000/api",
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.js",
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
