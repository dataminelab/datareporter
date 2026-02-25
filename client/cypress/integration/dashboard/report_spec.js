import { editDashboard } from "../../support/dashboard";

describe("Dashboard with Turnilo widget", () => {
  beforeEach(function () {
    cy.login();
  });

  before(function () {
    cy.login();
    cy.createDashboard("Turnilo Dashboard").then(({ id }) => {
      this.dashboardId = id;
      this.dashboardUrl = `/dashboards/${id}`;
    });
  });

  it("adds report widget", function () {
    cy.visit(this.dashboardUrl);
    editDashboard();
    cy.getByTestId("AddReportButton").click();
    cy.getByTestId("AddReportDialog").within(() => {
      cy.get("input").type("New Report");
      cy.get(".report-selector-result").first().click();
    });
    cy.contains("button", "Add to Dashboard").click();
    cy.getByTestId("AddReportDialog").should("not.exist");
    cy.get(".turnilo-widget-view").should("exist");
  });

  it("should load report widget", function () {
    cy.visit(this.dashboardUrl);
    // Find the turnilo-widget element within the dashboard
    cy.get(".turnilo-widget-view").should("be.visible");
    cy.wait(5000); // eslint-disable-line cypress/no-unnecessary-waiting
    // Check for the report page header which should not be present
    cy.get(".turnilo-widget-view").within(() => {
      cy.get(".message.error").should("not.exist");
    });
  });

  it("removes report widget", function () {
    cy.visit(this.dashboardUrl);
    editDashboard();
    cy.get(".turnilo-widget-view")
      .parent()
      .parent()
      .parent()
      .within(() => {
        cy.getByTestId("WidgetDeleteButton").click();
      });
    cy.contains("button", "Delete").click();
    cy.get(".turnilo-widget-view").should("not.exist");
  });
});
