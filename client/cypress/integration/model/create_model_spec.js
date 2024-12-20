describe("Create Model", () => {
  beforeEach(() => {
    cy.login();
  });

  it("opens the creation dialog when clicking in the create link or button", () => {
    cy.visit("/models");
    cy.server();
    cy.route("**/api/models", []); // force an empty response

    ["CreateModelButton"].forEach(createElementTestId => {
      cy.getByTestId(createElementTestId).click();
      cy.get(".ant-modal-content").should("exist");
      cy.getByTestId("CreateModelCancelButton").click();
      cy.get(".ant-modal-content").should("not.exist");
    });
  });

  // it("creates a new model out of PostgreSQL", () => {
  //   cy.visit("/models");
  //   cy.getByTestId("CreateModelButton").click();
  //   cy.get("#name").type("PostgreSQL example model");
  //   cy.get("div.ant-select-selection__rendered").click({multiple: false});
  //   cy.get("ul>li").click();

  //   cy.getByTestId("CreateSourceSaveButton").click();

  //   cy.contains("Saved.");
  // });
});
