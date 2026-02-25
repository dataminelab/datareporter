// Import jest-dom matchers
import "@testing-library/jest-dom/extend-expect";

// Suppress console warnings and logs for cleaner test output
const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  // Suppress Moment.js warnings
  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render is deprecated") ||
        args[0].includes("Warning: componentWillMount has been renamed") ||
        args[0].includes(
          "Deprecation warning: value provided is not in a recognized RFC2822 or ISO format",
        ))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  // Suppress React error boundary logs in tests (they're expected)
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes(
        "The above error occurred in the <ThrowError> component",
      ) ||
        args[0].includes("React will try to recreate this component tree"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Suppress error boundary console.log messages in tests
  console.log = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Error caught by boundary:")
    ) {
      return;
    }
    originalLog.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
  console.log = originalLog;
});

// Configure Enzyme for React 16 (if available)
try {
  const { configure } = require("enzyme");
  const Adapter = require("enzyme-adapter-react-16");
  configure({ adapter: new Adapter() });
} catch (e) {
  // Enzyme not available, using React Testing Library only
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();

// Mock moment for better date handling in tests
jest.mock("moment", () => {
  const actualMoment = jest.requireActual("moment");

  return date => {
    // Handle invalid dates gracefully in tests
    if (date === "value" || date === undefined || date === null) {
      return actualMoment("2023-01-01"); // Return a valid default date
    }
    return actualMoment(date);
  };
});
