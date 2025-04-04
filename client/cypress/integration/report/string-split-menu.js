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
context("String Split Menu", () => {
  const splitTiles = () => cy.get(".center-top-bar:not(.fallback) .filter-split-section");
  const channelTile = () => splitTiles().find(".split.dimension:contains(Api Key)");
  const openChannelMenu = () => channelTile().click();
  const splitMenu = () => cy.get(".split-menu");
  const limitDropdown = () => splitMenu().find(".dropdown.down:nth-child(2)");
  const limitOption = (option) => limitDropdown().find(`.dropdown-item:contains(${option})`);
  const limitSelection = () => limitDropdown().find(".selected-item");
  const sortDirection = () => splitMenu().find(".sort-direction .direction");
  const sortByDropdown = () => splitMenu().find(".sort-direction .dropdown");
  const sortBySelection = () => sortByDropdown().find(".selected-item");
  const sortByOption = (option) => sortByDropdown().find(`.dropdown-item:contains(${option})`);

  const urls = {
    // tslint:disable-next-line:max-line-length
    channelSplit: "http://localhost:9090/#wiki/4/N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADSEQC2ZyOFBAomgMYD0AqgCoDCVEADMICNGQBOUfAG1QaAJ4AHZjXpDJZYfnUVqGegAUpWACYy88kGZiT0WXASMBGACJCoE5fgC0LgxU1BHQyLxAAXwBdaOooZSQ0S2slVV0vSQhsAHMhMzoybChHXXYACzhsbDIET0xJNHxQLR0CODMzMjMhVLUoUzC8iC12DBxdTqh2QvycoVVMzG6CSOokWghGvABWAAZYkH7Mwatm7SlC6d12zu7qYXradCbCIIntOBhxITBEGDVVq80gR6HBYFpIlFqMostUzG4CkVHMkQOVKtVatRsHB6PE4FdqNAAEqYYiYRpQkAwqpdADK9S2IBuXSE5GyM3w2C+CGoZQg2TKSAFWy5CAQESAA=="
  };

  function assertSplitSettings(orderBy, descending, limit) {
    sortBySelection().should("contain", orderBy);
    sortDirection().should("have.class", descending ? "descending" : "ascending");
    limitSelection().should("contain", limit);
  }

  beforeEach(() => {
    cy.login();
    cy.createReport();
        
    cy.get("div.add-button").eq(1).click();
  
    cy.get("div.tile-row").eq(0).click();
    openChannelMenu();
  });

  it("should show split menu for string dimension", () => {
    splitMenu().should("exist");
  });

  it("should load split settings", () => {
    assertSplitSettings("Data Source", true, 50);
  });

  describe("Save action", () => {
    const save = () => splitMenu().find(".button.primary").click();

    it("should update splits limit", () => {
      limitSelection().click();
      limitOption(25).click();

      save();

      openChannelMenu();

      assertSplitSettings("Data Source", true, 25);
    });

    it("should update splits sort direction", () => {
      sortDirection().click();

      save();

      openChannelMenu();

      assertSplitSettings("Data Source", false, 50);
    });

    it("should update splits sort by", () => {
      sortBySelection().click();
      sortByOption("Api Key").click();

      save();

      openChannelMenu();

      assertSplitSettings("Api Key", true, 50);
    });
  });
});
