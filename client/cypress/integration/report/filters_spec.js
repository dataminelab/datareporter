context("Bar Chart", () => {

  const barChart = () => cy.get(".bar-chart");
  const xAxis = () => cy.get(".bar-chart-x-axis");
  const ticks = () => xAxis().find("g");
  const firstSeries = () => barChart().get(".bar-chart-bars:first");
  const bars = () => firstSeries().find(".bar-chart-bar");
  const previousBars = () => firstSeries().find(".bar-chart-bar-previous");
  const segments = () => firstSeries().find(".bar-chart-bar-segment");
  const previousSegments = () => firstSeries().find(".bar-chart-bar-previous-segment");
  const legend = () => cy.get(".bar-chart-legend");
  const legendValue = (idx) => legend().find(`.legend-value:nth-child(${idx}) .legend-value-name`);
  
  describe("Report Filters", () => {
    beforeEach(() => {
      cy.login();
      cy.createReport();
    });

    it("shows some data after datasource selection", () => {
      cy.get("div.total-container > .total > .measure-name").should("exist"); // Data Source
      cy.get("div.total-container > .total > .measure-value").should("exist"); // 1.0
    });

    
    it("should add a simple filter", () => {
      cy.get("div.add-button").eq(1).click();
      cy.get("div.tile-row").eq(1).click();

      cy.get("div.scroller > .top-gutter")
        .invoke('text')
        .should('equal', "Data Source");
      cy.get("div.scroller > .top-left-corner")
        .invoke('text')
        .should('equal', "Color 1");
    });

    it("should add a couple of filters", () => {
      // add multi filters with click clicks
      cy.get("div.add-button").eq(1).click();
      cy.get("div.tile-row").eq(1).click();

      cy.get("div.add-button").eq(1).click();
      cy.get("div.tile-row").eq(1).click();

      cy.get("div.scroller > .top-left-corner")
        .invoke('text')
        .should('equal', "Color 2, Color 1");
      cy.get("div.scroller > .top-gutter")
        .invoke('text')
        .should('equal', "Data Source");
    });

      
  it("should load bar-chart", () => {
    // add multi filters with click clicks
    cy.get("div.add-button").eq(1).click();
    cy.get("div.tile-row").eq(1).click();

    cy.get("div.add-button").eq(1).click();
    cy.get("div.tile-row").eq(1).click();

    cy.get("div.scroller > .top-left-corner")
      .invoke('text')
      .should('equal', "Color 2, Color 1");
    cy.get("div.scroller > .top-gutter")
      .invoke('text')
      .should('equal', "Data Source");

    cy.get(".vis-item.selected").click();
    cy.get(".vis-item.not-selected").eq(2).click();
    cy.get("button.button.primary").click();
    cy.wait(500);
    barChart().should("exist");
  });

    // it("should add a year over year (YOY) filters", () => {
    //   // add multi filters with clicky clicks
    //   // broken because no more than a single day data available.
    // });
  });
});