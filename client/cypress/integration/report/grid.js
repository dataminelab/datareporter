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
context("Grid", () => {

  const grid = () => cy.get(".internals.table-inner");
  const rows = () => grid().find(".split-value");


  beforeEach(() => {
    cy.login();
    cy.createReport();
    cy.get("div.add-button").eq(1).click();
    cy.get("div.tile-row").eq(1).click();
  });

  it("should load grid", () => {
    grid().should("exist");
  });

  it("should load 2 rows", () => {
    rows().should("have.length", 2);
  });
});
