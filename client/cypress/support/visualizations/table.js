export function expectTableToHaveLength(length) {
  cy.getByTestId("TableVisualization")
    .find("tbody tr")
    .then($rows => ($rows[0].classList.contains("ant-table-measure-row") ? $rows.slice(1) : $rows))
    .should("have.length", length);
}

export function expectFirstColumnToHaveMembers(values) {
  cy.getByTestId("TableVisualization")
    .find("tbody tr td:first-child")
    .then($cells => $cells.filter("td.ant-table-cell.display-as-string"))
    .then($cell => Cypress.$.map($cell, item => Cypress.$(item).text()))
    .then(firstColumnCells => expect(firstColumnCells).to.have.members(values));
}
