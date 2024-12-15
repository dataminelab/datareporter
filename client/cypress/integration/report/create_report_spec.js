describe("Create Report", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/reports/new");
  });

  it("executes and saves a report", () => {
    cy.clickThrough(`.add-button`);

    cy.getByTestId("bubble-menu")
      .get("input")
      .type("date", { force: true })
      .clickThrough("tile-row");

    // cy.getByTestId("ExecuteButton")
    //   .should("be.enabled")
    //   .click();

    // cy.getByTestId("TableVisualization").should("exist");
    // cy.percySnapshot("Edit Report - Table Visualization");

    // cy.getByTestId("SaveButton").click();
    // cy.url().should("match", /\/reports\/.+\/source/);
  });
});
