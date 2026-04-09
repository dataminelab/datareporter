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
      const moreButton = Cypress.$('[data-test="ReportPageHeaderMoreButton"]');

      if (!moreButton.length) {
        return;
      }

      cy.wrap(moreButton).click();
      cy.contains(
        ".ant-dropdown-menu .ant-dropdown-menu-item, .ant-dropdown-menu .ant-menu-item, .ant-dropdown-menu [role='menuitem']",
        "Save",
        { timeout: 10000 },
      ).click();
    });
  });
};
