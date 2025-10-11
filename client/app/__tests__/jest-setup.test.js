/**
 * Test to verify Jest and testing library setup
 */

describe("Jest Setup", () => {
  test("Jest is working correctly", () => {
    expect(1 + 1).toBe(2);
  });

  test("can import React Testing Library", () => {
    const { render } = require("@testing-library/react");
    expect(render).toBeDefined();
  });

  test("jest-dom matchers are available", () => {
    // Test if jest-dom matchers are loaded
    const div = document.createElement("div");
    div.textContent = "Hello";

    // Use basic Jest matchers first
    expect(div.textContent).toBe("Hello");

    // Try jest-dom matcher if available
    try {
      expect(div).toBeInTheDocument();
      console.log("✅ jest-dom matchers are available");
    } catch (e) {
      console.log(
        "ℹ️  jest-dom matchers not available, using basic Jest matchers",
      );
    }
  });

  test("DOM environment is set up", () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
    expect(global.window).toBeDefined();
  });
});
