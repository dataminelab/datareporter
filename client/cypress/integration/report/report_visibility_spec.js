const regularUser = {
  name: "Regular User",
  email: "regularuser@redash.io",
  password: "password",
};

describe("Report draft/publish visibility", () => {
  before(function () {
    cy.login();
    cy.createUser(regularUser);
  });

  beforeEach(function () {
    cy.login();
  });

  it("draft report is NOT visible to other users in the all-reports list", function () {
    cy.createReportDraft({ name: "Draft Only Report" }).then(report => {
      this.draftReportId = report.id;

      cy.logout();
      cy.login(regularUser.email, regularUser.password);
      cy.visit("/reports");
      cy.contains(report.name).should("not.exist");
    });
  });

  it("draft report IS visible to its owner in My Reports", function () {
    cy.createReportDraft({ name: "Owner Draft Report" }).then(report => {
      cy.visit("/reports/my");
      cy.contains(report.name).should("exist");
    });
  });

  it("published report IS visible to other users in the all-reports list", function () {
    cy.createReportDraft({ name: "Published Report Visibility" })
      .then(report => cy.publishReportAPI(report.id).then(() => report))
      .then(report => {
        cy.logout();
        cy.login(regularUser.email, regularUser.password);
        cy.visit("/reports");
        cy.contains(report.name).should("exist");
      });
  });

  it("unpublishing a report hides it from other users", function () {
    cy.createReportDraft({ name: "Unpublish Hides Report" })
      .then(report => cy.publishReportAPI(report.id).then(() => report))
      .then(report => cy.unpublishReportAPI(report.id).then(() => report))
      .then(report => {
        cy.logout();
        cy.login(regularUser.email, regularUser.password);
        cy.visit("/reports");
        cy.contains(report.name).should("not.exist");
      });
  });
});
