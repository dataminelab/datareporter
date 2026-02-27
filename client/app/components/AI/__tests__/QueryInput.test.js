import React from "react";
import { render, fireEvent } from "@testing-library/react";
import QueryInput from "../QueryInput";

describe("QueryInput", () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onStop: jest.fn(),
    isLoading: false,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders textarea with placeholder", () => {
    const { container } = render(<QueryInput {...defaultProps} />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeTruthy();
    expect(textarea.placeholder).toBe("Ask about your data...");
  });

  test("calls onSubmit when submit button clicked", () => {
    const { container } = render(<QueryInput {...defaultProps} />);
    const textarea = container.querySelector("textarea");
    const submitBtn = container.querySelector(".ai-query-submit");

    fireEvent.change(textarea, { target: { value: "Show users" } });
    fireEvent.click(submitBtn);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith("Show users");
  });

  test("calls onSubmit on Enter key press", () => {
    const { container } = render(<QueryInput {...defaultProps} />);
    const textarea = container.querySelector("textarea");

    fireEvent.change(textarea, { target: { value: "Show orders" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(defaultProps.onSubmit).toHaveBeenCalledWith("Show orders");
  });

  test("does not submit on Shift+Enter", () => {
    const { container } = render(<QueryInput {...defaultProps} />);
    const textarea = container.querySelector("textarea");

    fireEvent.change(textarea, { target: { value: "Line 1" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test("does not submit empty input", () => {
    const { container } = render(<QueryInput {...defaultProps} />);
    const submitBtn = container.querySelector(".ai-query-submit");

    expect(submitBtn.disabled).toBe(true);
  });

  test("does not submit whitespace-only input", () => {
    const { container } = render(<QueryInput {...defaultProps} />);
    const textarea = container.querySelector("textarea");

    fireEvent.change(textarea, { target: { value: "   " } });
    const submitBtn = container.querySelector(".ai-query-submit");

    expect(submitBtn.disabled).toBe(true);
  });

  test("clears input after submit", () => {
    const { container } = render(<QueryInput {...defaultProps} />);
    const textarea = container.querySelector("textarea");

    fireEvent.change(textarea, { target: { value: "Test query" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(textarea.value).toBe("");
  });

  test("shows stop button when loading", () => {
    const { container } = render(<QueryInput {...defaultProps} isLoading={true} />);
    const stopBtn = container.querySelector(".ai-query-stop");
    expect(stopBtn).toBeTruthy();
  });

  test("calls onStop when stop button clicked", () => {
    const { container } = render(<QueryInput {...defaultProps} isLoading={true} />);
    const stopBtn = container.querySelector(".ai-query-stop");

    fireEvent.click(stopBtn);
    expect(defaultProps.onStop).toHaveBeenCalled();
  });

  test("disables textarea when disabled prop is true", () => {
    const { container } = render(<QueryInput {...defaultProps} disabled={true} />);
    const textarea = container.querySelector("textarea");
    expect(textarea.disabled).toBe(true);
  });

  test("disables textarea when loading", () => {
    const { container } = render(<QueryInput {...defaultProps} isLoading={true} />);
    const textarea = container.querySelector("textarea");
    expect(textarea.disabled).toBe(true);
  });
});
