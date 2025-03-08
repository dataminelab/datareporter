describe("Create Report", () => {
  beforeEach(() => {
    cy.login();
    cy.createReport();
  });

  it("executes and saves a report", () => {
    cy.get("#_handleSaveReport").click();
    cy.contains("Save as...").should("exist");
    cy.contains("Save as").click();
  });

  it("archives a report", () => {
    cy.get("#_handleSaveReport").click();
    cy.contains("Save as...").should("exist");
    cy.getByTestId("ReportPageHeaderMoreButton").click();
    cy.wait(500);
    cy.get(".ant-dropdown-menu").contains("Archive").click();
    cy.wait(500);
    cy.get(".ant-modal-confirm-btns").contains("Archive").click();
    // url supposed to be /reports/archive
    cy.url().should("include", "/reports/archive");
  });
});
