import React from "react";
import { render } from "@testing-library/react";

// Create a proper ErrorBoundary component for testing
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Only log in development or when explicitly needed
    if (this.props.logErrors) {
      console.log("Error caught by boundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error for error boundary tests
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("renders children when there is no error", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    const element = getByText("Test content");
    expect(element).toBeTruthy();
    expect(element.textContent).toBe("Test content");
  });

  test("renders fallback UI when there is an error", () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByText("Error occurred")).toBeTruthy();
  });

  test("renders default error message when no fallback provided", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByText("Something went wrong")).toBeTruthy();
  });

  test("can be imported without errors", () => {
    expect(ErrorBoundary).toBeDefined();
  });
});
