import { editDashboard } from "../../support/dashboard";

describe("Dashboard with Turnilo widget", () => {
  const confirmDeletionInModal = () => {
    cy.get(".ant-modal .ant-btn").contains("Delete").click({ force: true });
  };

  beforeEach(function () {
    cy.login();
  });

  before(function () {
    cy.login();
    cy.createDashboard("Turnilo Dashboard")
      .then(({ id }) => {
        this.dashboardId = id;
        this.dashboardUrl = `/dashboards/${id}`;
      })
      .then(() => cy.createReportDraft({ name: "Turnilo Cypress Report" }))
      .then(({ id }) => {
        this.reportId = id;
      });
  });

  it("adds report widget", function () {
    cy.visit(this.dashboardUrl);
    editDashboard();
    cy.getByTestId("AddReportButton").click();
    cy.getByTestId("AddReportDialog").within(() => {
      cy.get("input").type("Turnilo Cypress Report");
      cy.get(`.report-selector-result[data-test="QueryId${this.reportId}"]`)
        .should("be.visible")
        .click();
    });
    cy.contains("button", "Add to Dashboard").click();
    cy.getByTestId("AddReportDialog").should("not.exist");
    cy.get(".turnilo-widget-view", { timeout: 30000 }).should("be.visible");
  });

  it("should load report widget", function () {
    cy.visit(this.dashboardUrl);
    cy.get(".turnilo-widget-view", { timeout: 30000 }).should("be.visible");
    cy.get(".turnilo-widget-view").within(() => {
      cy.get(".message.error").should("not.exist");
    });
  });

  it("removes report widget", function () {
    cy.visit(this.dashboardUrl);
    editDashboard();
    cy.get('.widget-wrapper[data-test^="WidgetId"]:has(.turnilo-widget-view)')
      .first()
      .within(() => {
        cy.getByTestId("WidgetDeleteButton").click();
      });
    confirmDeletionInModal();
    cy.get(".turnilo-widget-view").should("not.exist");
  });
});
