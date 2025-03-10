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

// not working
context("Split Tile", () => {

  const splitsContainer = () => cy.get(".center-top-bar:not(.fallback) .split-tile");
  const dragMask = () => cy.get(".drag-mask");
  const splitTile = (dimension) => splitsContainer().find(`.split.dimension:contains(${dimension})`);
  const addSplitButton = () => splitsContainer().find(".add-tile");
  const splitItemsRow = () => splitsContainer().find(".items");
  const splitItems = () => splitsContainer().find(".split.dimension");
  const splitOverflow = () => splitsContainer().find(".items .overflow.dimension");
  const splitOverflowMenu = () => cy.get(".overflow-menu");
  const addSplitMenu = () => cy.get(".add-tile-menu");
  const splitMenu = () => cy.get(".split-menu");
  const dimensionsList = () => cy.get(".dimension-list-tile");
  const dimensionTile = (dimension) => cy.get(`.dimension-list-tile .dimension:contains(${dimension})`);
  const dimensionAddSplitAction = () => cy.get(".dimension-actions-menu .subsplit.action");
  const dimensionReplaceSplitAction = () => cy.get(".dimension-actions-menu .split.action");

  const shouldHaveSplits = (...splits) => {
    splitItems().should("have.length", splits.length);
    splitItemsRow().within(() => {
      splits.forEach((split, idx) => {
        cy.get(`.split.dimension:nth-child(${idx + 1})`)
          .should("contain", split);
      });
    });
  };

  describe("No splits in View Definition", () => {
    beforeEach(() => {
      cy.login();
      cy.createReport();
    });

    it("should load with no splits", () => {
      splitItemsRow().should("be.empty");
    });

    it("should add Api Key split with plus button", () => {
      addSplitButton().click();

      addSplitMenu().find(".label:contains('Api Key')").click();

      shouldHaveSplits("Api Key");
    });

    it("should add Api Key split with plus button using search field", () => {
      addSplitButton().click();

      addSplitMenu().within(() => {
        cy.get(".search-box input").type("Api Key");

        cy.get(".label")
          .should("have.length", 1)
          .should("contain", "Api Key")
          .click();
      });

      shouldHaveSplits("Api Key");
    });

    it("should add Api Key split with dimension action", () => {
      dimensionTile("Api Key").click();

      dimensionAddSplitAction().click();

      shouldHaveSplits("Api Key");
    });

    it("should add Api Key split with dimension action using search field", () => {
      dimensionsList().within(() => {
        cy.get(".icon.search").click();
        cy.get(".search-box input").type("Api Key");
        cy.get(".rows .dimension")
          .should("have.length", 1)
          .should("contain", "Api Key")
          .click();
      });

      dimensionAddSplitAction().click();

      shouldHaveSplits("Api Key");
    });
  });

  describe("Api Key split already in View Definition", () => {
    beforeEach(() => {
      cy.login();
      cy.createReport();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Api Key')").click();
    });

    it("should load with Api Key split", () => {
      shouldHaveSplits("Api Key");
    });

    it("Api Key should not be available in add split list", () => {
      addSplitButton().click();

      addSplitMenu().find(".label:contains('Api Key')")
        .should("not.exist");
    });

    it("should add split with plus button", () => {
      addSplitButton().click();

      addSplitMenu().find(".label:contains('Color 1')").click();

      shouldHaveSplits("Color 1", "Api Key");
    });

    it("Api Key dimension should not have Add split action", () => {
      dimensionTile("Api Key").click();

      dimensionAddSplitAction()
        .should("have.class", "disabled")
        .click();

      shouldHaveSplits("Api Key");
    });

    it("should add split with dimension action", () => {
      dimensionTile("Color 1").click();

      dimensionAddSplitAction().click();

      shouldHaveSplits("Color 1", "Api Key");
    });

    it("should replace split with dimension action", () => {
      dimensionTile("Color 1").click();

      dimensionReplaceSplitAction().click();

      shouldHaveSplits("Color 1");
    });
  });

  describe("Three splits already in View Definition", () => {
    beforeEach(() => {
      // Force viewport that shows overflows for three tiles
      cy.viewport(1000, 800);
      cy.login();
      cy.createReport();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Is Archived')").click();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Api Key')").click();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Color 1')").click();
    });

    it("should load with two split tiles", () => {
      shouldHaveSplits("Color 1", "Api Key");
    });

    it("should show overflow tile for third split", () => {
      splitOverflow().should("contain", "+1");
    });

    it("should show overflowed split after clicking tile", () => {
      splitOverflow().click();

      splitOverflowMenu().find(".split.dimension")
        .should("contain", "Is Archived");
    });

    it("should open split menu inside overflow tile", () => {
      splitOverflow().click();

      splitOverflowMenu().find(".split.dimension")
        .click();

      splitMenu().should("exist");
    });
  });

  describe("Remove action", () => {
    beforeEach(() => {
      cy.login();
      cy.createReport();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Api Key')").click();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Color 1')").click();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Is Archived')").click();
    });

    it('should remove split after clicking "x" icon', () => {
      splitTile("Color 1").find(".remove")
        .click();

      shouldHaveSplits("Is Archived", "Api Key");
    });
  });

  describe("Drag and drop", () => {
    const dataTransfer = new DataTransfer();
    beforeEach(() => {
      cy.login();
      cy.createReport();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Api Key')").click();
    });

    it("adds split by dropping dimension", () => {
      dimensionTile("Color 1")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      dragMask().trigger("drop");

      shouldHaveSplits("Api Key", "Color 1");
    });

    it("replaces split by dropping dimension on existing split", () => {
      dimensionTile("Color 1")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      splitTile("Api Key").then(([channelSplit]) => {
        const { left, width } = channelSplit.getBoundingClientRect();

        dragMask().trigger("drop", { clientX: left + width / 2 });

        shouldHaveSplits("Color 1");
      });
    });

    it("can not drop dimension for which split already exists", () => {
      dimensionTile("Api Key")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      dragMask().should("not.exist");
    });

    it("rearranges splits", () => {
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Is Archived')").click();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Color 1')").click();

      splitTile("Api Key")
        .trigger("dragstart", { dataTransfer });

      splitsContainer().trigger("dragenter");

      splitTile("Color 1")
        .then(([timeSplit]) => {
          const { left, width } = timeSplit.getBoundingClientRect();

          dragMask().trigger("drop", { clientX: left + width });

          shouldHaveSplits("Api Key", "Color 1", "Is Archived");
        });
    });
  });

  describe("Split menu", () => {
    beforeEach(() => {
      cy.login();
      cy.createReport();
      addSplitButton().click();
      addSplitMenu().find(".label:contains('Created At')").click();
    });

    it("split menu has action buttons", () => {
      splitTile("Created At").click();

      splitMenu().find(".button-bar .primary").should("contain", "OK");
      splitMenu().find(".button-bar .secondary").should("contain", "Cancel");
    });

    it("split menu OK action should be disabled upon menu opening", () => {
      splitTile("Created At").click();

      splitMenu().find(".button-bar .primary").should("have.attr", "disabled");
    });

    it("split menu OK action should be enabled after changing split options", () => {
      splitTile("Created At").click();

      splitMenu().find(".sort-direction .direction").click();

      splitMenu().find(".button-bar .primary").should("not.have.attr", "disabled");
    });

    describe("Created At Split menu", () => {
      it("should show split menu for time dimension", () => {
        splitTile("Created At").click();

        splitMenu().should("exist");
      });

      it("time split menu has granularity controls", () => {
        splitTile("Created At").click();

        splitMenu().find(".button-group").within(() => {
          cy.get(".button-group-title").should("contain", "Granularity");
          cy.get(".group-container .group-member").should("have.length", 6);
          cy.get(".group-container .group-member.selected").should("exist");
          cy.get(".group-container .group-member:last").should("contain", "…");
        });
      });

      it('granularity "…" option show input box', () => {
        splitTile("Created At").click();

        splitMenu().find(".button-group .group-member:last").click();

        splitMenu().find(".custom-input")
          .should("have.class", "invalid")
          .should("have.value", "")
          .should("have.attr", "placeholder", "e.g. PT2H or P3M");
      });

      it("time split menu has sort controls", () => {
        splitTile("Created At").click();

        splitMenu().find(".sort-direction").within(() => {
          cy.get(".direction").should("have.class", "ascending");
          cy.get(".dropdown-label").should("contain", "Sort by");
          cy.get(".dropdown .selected-item").should("contain", "Created At");
        });
      });

      it("time split menu has limit controls", () => {
        splitTile("Created At").click();

        // TODO: add meaningful classnames for limit dropdown!
        cy.get(".split-menu > .dropdown.down").within(() => {
          cy.get(".dropdown-label").should("contain", "Limit");
          cy.get(".selected-item").should("contain", "None");
        });
      });
    });

    // There is no number split in the test data yet
    // describe("Number Split menu", () => {
    //   it("should show split menu for number dimension", () => {
    //     splitTile("Created At").find(".remove")
    //       .click();
    //     addSplitButton().click();
    //     addSplitMenu().find(".label:contains('Api Key')").click();
    //     splitTile("Api Key").click();

    //     splitMenu().should("exist");
    //   });

    //   it("number split menu has granularity controls", () => {
    //     splitTile("Created At").find(".remove")
    //       .click();
    //     addSplitButton().click();
    //     addSplitMenu().find(".label:contains('Api Key')").click();
    //     splitTile("Api Key").click();

    //     splitMenu().find(".button-group").within(() => {
    //       cy.get(".button-group-title").should("contain", "Granularity");
    //       cy.get(".group-container .group-member").should("have.length", 6);
    //       cy.get(".group-container .group-member.selected").should("exist");
    //       cy.get(".group-container .group-member:last").should("contain", "…");
    //     });
    //   });

    //   it('granularity "…" option show input box', () => {
    //     splitTile("Created At").find(".remove")
    //       .click();
    //     addSplitButton().click();
    //     addSplitMenu().find(".label:contains('Api Key')").click();
    //     splitTile("Api Key").click();

    //     splitMenu().find(".button-group .group-member:last").click();

    //     splitMenu().find(".custom-input")
    //       .should("have.class", "invalid")
    //       .should("have.value", "")
    //       .should("have.attr", "placeholder", "Bucket size");
    //   });

    //   it("number split menu has sort controls", () => {
    //     splitTile("Created At").find(".remove")
    //       .click();
    //     addSplitButton().click();
    //     addSplitMenu().find(".label:contains('Api Key')").click();
    //     splitTile("Api Key").click();

    //     splitMenu().find(".sort-direction").within(() => {
    //       cy.get(".direction").should("have.class", "descending");
    //       cy.get(".dropdown-label").should("contain", "Sort by");
    //       cy.get(".dropdown .selected-item").should("contain", "Data Source");
    //     });
    //   });

    //   it("number split menu has limit controls", () => {
    //     splitTile("Created At").find(".remove")
    //       .click();
    //     addSplitButton().click();
    //     addSplitMenu().find(".label:contains('Api Key')").click();
    //     splitTile("Api Key").click();

    //     // TODO: add meaningful classnames for limit dropdown!
    //     cy.get(".split-menu > .dropdown.down").within(() => {
    //       cy.get(".dropdown-label").should("contain", "Limit");
    //       cy.get(".selected-item").should("contain", 5);
    //     });
    //   });
    // });
  });
});
