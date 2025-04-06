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

context("Boolean Filter Menu", () => {

  const filterTiles = () => cy.get(".center-top-bar:not(.fallback) .filter-tile-row");
  const booleanMenu = () => cy.get(".boolean-filter-menu");
  const booleanMenuTable = () => booleanMenu().find(".menu-table");
  const falseOption = () => booleanMenuTable().find(".row:contains('false')");
  const trueOption = () => booleanMenuTable().find(".row:contains('true')");
  const booleanMenuOkButton = () => booleanMenu().find(".button.primary");
  const booleanMenuCancelButton = () => booleanMenu().find(".button.secondary");

  const urls = {
    isRobotAllValues: "#reports/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggvAHoZAAmAProVupkAAqOWBEuoBEwDuhYuAQJAIwAIlZQ9sL4ALT5qp7eQvalIEoAuiputcHEmAJkcLjUAUEE0DEOvAAWEGCRVmCIMGQuCghizdTYmGj4y8prIFDCSGhphB0EpQ4QnFYRvmTYUDnB/AiYDlH5JW9beKCDwRF0HAolBMJleGQohAInEzvtkosbhAArxGLkQBFFhDsLdrtQvJdMDCCE1qEg1BAfgBWAAMLWoYkuiLwrhAg0c9whAKBILBY0h0Kscjealiv1OXgBgTgMDss3m3lJEu8GjgsACTT2wiu2EihTuDxyLi1OsiTG+3KIvPBAphSiAA",
    isRobotOnlyTrueValues: "#reports/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggvAHoZAAmAProVupkAAqOWBEuoBEwDuhYuAQJAIwAIlZQ9sL4ALT5qp7eQvalIEoAui3UUMJIaGmEtcGlDhCcVhG+ZNhQOcH8CJgOUfklc2g8IAFBBBHocFFQmJm8ZFEQEXF9BGKDZNzUowG8jLkgEdeH2KPD1F6DmKcETdQkGoICs8ABWAAMbRAlwg13wrjWgUc40OwS2RF2+wch2Op2ocjmalieDc52egTgMDsVjAiBg3gBvS8wQ0cFgASazS+Q2wkUKYwmORc3JAwl5kSYy3R2yxByOJyaQA",
  }
  function assertSelection(isTrueOptionSelected, isFalseOptionSelected) {
    function selectionToPredicate(isSelected) {
      return isSelected ? "have.class" : "not.have.class";
    }

    booleanMenuTable()
      .within(() => {
        cy.get(".row:contains('true') .checkbox")
          .should(selectionToPredicate(isTrueOptionSelected), "selected");
        cy.get(".row:contains('false') .checkbox")
          .should(selectionToPredicate(isFalseOptionSelected), "selected");
      });
  }

  beforeEach(() => {
    cy.login();
    cy.createReport();
    cy.get("div.add-button").eq(1).click();
    cy.get("div.tile-row").eq(1).click();
    cy.get("div.add-button").eq(0).click();
    cy.get("div.tile-row").eq(4).click();
  });

  describe("Opening menu", () => {
    it("should show menu", () => {
      booleanMenu().should("exist");
    });

    it("should load possible values", () => {
      booleanMenuTable()
        .find(".row")
        .should("have.length", 2);
    });

    it("should mark selected values", () => {
      trueOption().click();
      assertSelection(true, false);
    });

    it("should have disabled Ok button", () => {
      booleanMenuOkButton().should("be.disabled");
    });
  });

  describe("Closing menu", () => {
    it("should close menu after clicking cancel", () => {
      booleanMenuCancelButton().click();

      booleanMenu().should("not.exist");
    });

    it("should close menu after clicking outside menu", () => {
      cy.get("div.visualization").click();

      booleanMenu().should("not.exist");
    });

    it("should not change url after closing menu without changes", () => {
      booleanMenuCancelButton().click();
      const hash = window.location.hash;
      cy.location('hash').should('equal', urls.isRobotOnlyTrueValues);
    });
  });

  describe("Changing selection", () => {
    it("should change selection after clicking option", () => {
      falseOption().click();
      trueOption().click();

      assertSelection(true, true);
    });

    it("should enable Ok button after changing selection", () => {
      falseOption().click();

      booleanMenuOkButton().should("be.not.disabled");
    });

    it("should disable Ok button after reverting to previous selection", () => {
      falseOption().click();
      falseOption().click();

      booleanMenuOkButton().should("be.disabled");
    });
  });

  describe("Saving selection", () => {
    it("should close menu after saving selection", () => {
      falseOption().click();

      booleanMenuOkButton().click();

      booleanMenu().should("not.exist");
    });

    it("should persist selection change to url", () => {
      falseOption().click();

      booleanMenuOkButton().click();
      const hash = window.location.hash;
      cy.location('hash').should('equal', urls.isRobotAllValues);
    });

    it("should not change url after canceling selection", () => {
      falseOption().click();

      booleanMenuCancelButton().click();
      const hash = window.location.hash;
      cy.location('hash').should('equal', urls.isRobotOnlyTrueValues);
    });
  });
});
