/*
 * Copyright 2017-2022 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

  describe("Time split", () => {
    beforeEach(() => {
      cy.login();
      cy.createReport();
      
      cy.get("div.add-button").eq(1).click();
      
      cy.get("div.tile-row").eq(0).click();
      cy.get(".vis-item.selected").click();
      cy.get(".vis-item.not-selected").eq(2).click();
      cy.get("button.button.primary").click();
    });

    it("should load bar-chart", () => {
      barChart().should("exist");
    });

    describe("x-axis", () => {
      it("should load 1 tick", () => {
        ticks().should("have.length", 1);
      });
    });

    describe("bars", () => {
      it("should load 1 bar", () => {
        bars().should("have.length", 1);
      });
    });

    describe("with time-shift", () => {
      beforeEach(() => {
        cy.login();
        cy.createReport();
        
        cy.get("div.add-button").eq(1).click();
      
        cy.get("div.tile-row").eq(0).click();
        cy.get(".vis-item.selected").click();
        cy.get(".vis-item.not-selected").eq(2).click();
        cy.get("button.button.primary").click();
      });

      // describe("bar segments", () => {
      //   it("should load 60 bars for current series", () => {
      //     bars().should("have.length", 60);
      //   });

      //   it("should load 60 bars for previous series", () => {
      //     previousBars().should("have.length", 60);
      //   });
      // });
    });
  });

  describe("Time with nominal split", () => {
    beforeEach(() => {
      cy.login();
      cy.createReport();
      
      cy.get("div.add-button").eq(1).click();
      
      cy.get("div.tile-row").eq(0).click();
      cy.get(".vis-item.selected").click();
      cy.get(".vis-item.not-selected").eq(2).click();
      cy.get("button.button.primary").click();
    });

    // describe("legend", () => {
    //   it("should render Legend", () => {
    //     legend().should("exist");
    //   });

    //   it("should render Legend header", () => {
    //     legend().find(".legend-header").should("have.text", "Channel");
    //   });

    //   function assertLegendRowsInOrder(...values) {
    //     values.forEach((label, idx) => {
    //       legendValue(idx + 1).should("contain", label);
    //     });
    //   }

    //   it("should render Legend values", () => {
    //     assertLegendRowsInOrder("en", "it", "fr", "ru", "es");
    //   });
    // });

    // describe("bar segments", () => {
    //   it("should load 120 bar segments", () => {
    //     segments().should("have.length", 120);
    //   });
    // });

    describe("with time-shift", () => {
      beforeEach(() => {
        cy.login();
        cy.createReport();
        
        cy.get("div.add-button").eq(1).click();
      
        cy.get("div.tile-row").eq(0).click();
        cy.get(".vis-item.selected").click();
        cy.get(".vis-item.not-selected").eq(2).click();
        cy.get("button.button.primary").click();
      });

      // describe("bar segments", () => {
      //   it("should load 193 segments for current series", () => {
      //     segments().should("have.length", 193);
      //   });

      //   it("should load 193 segments for previous series", () => {
      //     previousSegments().should("have.length", 193);
      //   });
      // });
    });
  });
});
