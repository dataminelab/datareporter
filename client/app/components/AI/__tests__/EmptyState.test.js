import React from "react";
import { render, fireEvent } from "@testing-library/react";
import EmptyState from "../EmptyState";

describe("EmptyState", () => {
  const defaultProps = {
    dataSources: [
      { id: 1, name: "PostgreSQL" },
      { id: 2, name: "MySQL" },
    ],
    selectedDataSourceId: 1,
    onDataSourceChange: jest.fn(),
    onSuggestionClick: jest.fn(),
    configError: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders main title", () => {
    const { getByText } = render(<EmptyState {...defaultProps} />);
    expect(getByText("Ask questions about your data in plain English")).toBeTruthy();
  });

  test("renders subtitle", () => {
    const { getByText } = render(<EmptyState {...defaultProps} />);
    expect(getByText("I'll generate SQL queries for you.")).toBeTruthy();
  });

  test("renders default suggestion cards", () => {
    const { getByText } = render(<EmptyState {...defaultProps} />);
    expect(getByText("Top 10 customers by revenue")).toBeTruthy();
    expect(getByText("Revenue trend over the past 12 months")).toBeTruthy();
    expect(getByText("Orders by status")).toBeTruthy();
    expect(getByText("Daily signups this month")).toBeTruthy();
  });

  test("renders custom suggestions when provided", () => {
    const { getByText, queryByText } = render(
      <EmptyState {...defaultProps} suggestions={["Custom query 1", "Custom query 2"]} />
    );
    expect(getByText("Custom query 1")).toBeTruthy();
    expect(getByText("Custom query 2")).toBeTruthy();
    expect(queryByText("Top 10 customers by revenue")).toBeNull();
  });

  test("calls onSuggestionClick when suggestion card clicked", () => {
    const { getByText } = render(<EmptyState {...defaultProps} />);
    fireEvent.click(getByText("Orders by status"));
    expect(defaultProps.onSuggestionClick).toHaveBeenCalledWith("Orders by status");
  });

  test("renders data source selector", () => {
    const { getByText } = render(<EmptyState {...defaultProps} />);
    expect(getByText("Data Source:")).toBeTruthy();
  });

  test("does not render data source selector when no data sources", () => {
    const { queryByText } = render(
      <EmptyState {...defaultProps} dataSources={[]} />
    );
    expect(queryByText("Data Source:")).toBeNull();
  });

  test("shows config error when present", () => {
    const configError = {
      title: "AI provider not configured",
      message: "An admin needs to set up an AI provider.",
    };
    const { getByText, queryByText } = render(
      <EmptyState {...defaultProps} configError={configError} />
    );
    expect(getByText("AI provider not configured")).toBeTruthy();
    expect(getByText("An admin needs to set up an AI provider.")).toBeTruthy();
    // Should NOT show suggestions when there's a config error
    expect(queryByText("Top 10 customers by revenue")).toBeNull();
  });

  test("shows action link in config error", () => {
    const configError = {
      title: "No data sources",
      message: "Connect a database first.",
      action: { label: "Go to Settings", href: "data_sources" },
    };
    const { getByText } = render(
      <EmptyState {...defaultProps} configError={configError} />
    );
    const link = getByText("Go to Settings →");
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("data_sources");
  });

  test("renders warning icon for config error", () => {
    const configError = {
      title: "Error",
      message: "Something broke",
    };
    const { container } = render(
      <EmptyState {...defaultProps} configError={configError} />
    );
    const warningIcon = container.querySelector(".ai-empty-icon-warning");
    expect(warningIcon).toBeTruthy();
  });

  test("renders sparkle icon in normal state", () => {
    const { container } = render(<EmptyState {...defaultProps} />);
    const icon = container.querySelector(".ai-empty-icon");
    expect(icon).toBeTruthy();
  });
});
