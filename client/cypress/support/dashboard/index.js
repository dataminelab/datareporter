/* global cy */

const { get } = Cypress._;
const RESIZE_HANDLE_SELECTOR = ".react-resizable-handle";

export function getWidgetTestId(widget) {
  return `WidgetId${widget.id}`;
}

export function createQueryAndAddWidget(
  dashboardId,
  queryData = {},
  widgetOptions = {},
) {
  return cy
    .createQuery(queryData)
    .then(query => {
      const visualizationId = get(query, "visualizations.0.id");
      assert.isDefined(
        visualizationId,
        "Query api call returns at least one visualization with id",
      );
      return cy.addWidget(dashboardId, visualizationId, widgetOptions);
    })
    .then(getWidgetTestId);
}

export function editDashboard() {
  return cy.get("body").then($body => {
    const alreadyEditing = $body
      .find(".dashboard-control")
      .toArray()
      .some(control => {
        const $control = Cypress.$(control);
        const saveStatus = $control.find(".save-status").text().trim();
        const buttonLabel = $control.find("button").text().trim();

        return saveStatus === "Saved" && buttonLabel.includes("Done Editing");
      });

    if (alreadyEditing) {
      return cy.wrap(true);
    }

    cy.getByTestId("DashboardMoreButton").click();
    cy.getByTestId("DashboardMoreButtonMenu").contains("Edit").click();

    return cy.wrap(true);
  });
}

export function shareDashboard() {
  cy.clickThrough(
    { button: "Publish" },
    `OpenShareForm
    PublicAccessEnabled`,
  );

  return cy.getByTestId("SecretAddress").invoke("val");
}

export function resizeBy(wrapper, offsetLeft = 0, offsetTop = 0) {
  return wrapper.within(() => {
    cy.get(RESIZE_HANDLE_SELECTOR).dragBy(offsetLeft, offsetTop, true);
  });
}
