export const setupReportTests = (additionalSetup = null) => {
  beforeEach(() => {
    cy.login();
    cy.createReport();

    if (additionalSetup) {
      additionalSetup();
    }
  });

  afterEach(() => {
    cy.getByTestId("ReportPageHeaderMoreButton").click();
    cy.get(".ant-dropdown-menu").contains("Save").click();
  });
};
