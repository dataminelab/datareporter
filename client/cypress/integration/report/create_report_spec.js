describe("Create Report", () => {
  beforeEach(() => {
    cy.login();
    cy.updateOrgSettings({ disable_public_urls: false });
    cy.createReport();
    cy.getByTestId("ReportPageHeaderMoreButton").click();
  });

  it("saves a report", () => {
    // executes happens in beforeEach
    cy.contains("Save").should("exist").click();
  });

  it("archives a report", () => {
    cy.get(".ant-dropdown-menu").contains("Archive").click();
    cy.get(".ant-modal-confirm-btns", { timeout: 10000 }).should("be.visible");
    cy.get(".ant-modal-confirm-btns").contains("Archive").click();
    // url supposed to be /reports/archive
    cy.url().should("include", "/reports/archive");
  });

  it("shows embed url for report", () => {
    cy.getByTestId("ShowEmbedDialogButton").click();
    cy.getByTestId("EmbedIframe")
      .invoke("text")
      .should("include", "/embed/report/");
  });
});
