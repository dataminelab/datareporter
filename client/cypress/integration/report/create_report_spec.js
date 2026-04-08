describe("Create Report", () => {
  beforeEach(() => {
    cy.login();
    cy.createReport();
    cy.getByTestId("ReportPageHeaderMoreButton").click();
  });

  it("saves a report", () => {
    // executes happens in beforeEach
    cy.contains("Save").should("exist").click();
  });

  it("archives a report", () => {
    cy.get(".ant-dropdown-menu").contains("Archive").click();
    cy.wait(500);
    cy.get(".ant-modal-confirm-btns").contains("Archive").click();
    // url supposed to be /reports/archive
    cy.url().should("include", "/reports/archive");
  });
});
