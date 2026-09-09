export const setupReportTests = (additionalSetup = null) => {
  beforeEach(() => {
    cy.login();
    cy.createReport();
    cy.get(".report-page-header", { timeout: 30000 }).should("be.visible");
    cy.get(".center-top-bar .split-tile", { timeout: 30000 }).should(
      "be.visible",
    );

    if (additionalSetup) {
      additionalSetup();
    }
  });

  afterEach(function () {
    if (this.currentTest.state === "failed") {
      return;
    }

    cy.then(() => {
      const saveButton = Cypress.$('[data-test="ReportPageSaveButton"]');

      if (!saveButton.length) {
        return;
      }

      cy.get('[data-test="ReportPageSaveButton"]', { timeout: 10000 }).click();
    });
  });
};
