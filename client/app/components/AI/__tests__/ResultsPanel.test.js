import React from "react";
import { render, fireEvent } from "@testing-library/react";
import ResultsPanel from "../ResultsPanel";

// Ant Design Table uses window.matchMedia for responsive breakpoints
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe("ResultsPanel", () => {
  test("returns null when no SQL", () => {
    const { container } = render(<ResultsPanel />);
    expect(container.firstChild).toBeNull();
  });

  test("shows loading spinner when isLoading", () => {
    const { container, getByText } = render(<ResultsPanel isLoading={true} />);
    expect(getByText("Generating query...")).toBeTruthy();
  });

  test("shows error state with title and message", () => {
    const error = {
      title: "Query failed",
      message: "Connection refused",
    };
    const { getByText } = render(<ResultsPanel error={error} />);
    expect(getByText("Query failed")).toBeTruthy();
    expect(getByText("Connection refused")).toBeTruthy();
  });

  test("shows error details when provided", () => {
    const error = {
      title: "Error",
      message: "Bad query",
      details: "Try being more specific",
    };
    const { getByText } = render(<ResultsPanel error={error} />);
    expect(getByText("Try being more specific")).toBeTruthy();
  });

  test("shows retry button on error when onRetry provided", () => {
    const onRetry = jest.fn();
    const error = { title: "Error", message: "Failed" };
    const { container } = render(<ResultsPanel error={error} onRetry={onRetry} />);

    const retryBtn = container.querySelector(".ai-error-actions button");
    expect(retryBtn).toBeTruthy();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  test("shows SQL tab when sql provided", () => {
    const { getByText } = render(
      <ResultsPanel sql="SELECT name FROM users" />
    );
    // SQL tab should exist (even if not active by default)
    expect(getByText("SQL")).toBeTruthy();
  });

  test("shows explanation when provided", () => {
    const { getByText } = render(
      <ResultsPanel
        sql="SELECT 1"
        explanation="This counts everything."
      />
    );
    expect(getByText("This counts everything.")).toBeTruthy();
  });

  test("shows Execute button when no queryResult", () => {
    const onExecute = jest.fn();
    const { getByText } = render(
      <ResultsPanel sql="SELECT 1" onExecute={onExecute} />
    );
    const executeBtn = getByText("Execute Query");
    expect(executeBtn).toBeTruthy();
    fireEvent.click(executeBtn);
    expect(onExecute).toHaveBeenCalled();
  });

  test("shows results table when queryResult provided", () => {
    const queryResult = {
      columns: [
        { name: "id", friendly_name: "ID" },
        { name: "name", friendly_name: "Name" },
      ],
      rows: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
    };
    const { getByText } = render(
      <ResultsPanel sql="SELECT id, name FROM users" queryResult={queryResult} />
    );
    expect(getByText("Alice")).toBeTruthy();
    expect(getByText("Bob")).toBeTruthy();
  });

  test("shows title and execution time", () => {
    const { getByText } = render(
      <ResultsPanel
        sql="SELECT 1"
        title="Query Results"
        executionTime={0.42}
        queryResult={{ columns: [{ name: "x" }], rows: [{ x: 1 }] }}
      />
    );
    expect(getByText("Query Results")).toBeTruthy();
    expect(getByText("Ran in 0.42s")).toBeTruthy();
  });

  test("shows Download CSV button when results exist", () => {
    const queryResult = {
      columns: [{ name: "id" }],
      rows: [{ id: 1 }],
    };
    const { getByText } = render(
      <ResultsPanel sql="SELECT 1" queryResult={queryResult} />
    );
    expect(getByText("Download CSV")).toBeTruthy();
  });

  test("shows 'No results to display' for empty data", () => {
    const queryResult = { columns: null, rows: null };
    const { getByText } = render(
      <ResultsPanel sql="SELECT 1" queryResult={queryResult} />
    );
    expect(getByText("No results to display.")).toBeTruthy();
  });
});
