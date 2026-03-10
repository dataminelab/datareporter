import React from "react";
import { mount } from "enzyme";
import AIQueryBar from "./AIQueryBar";

// Mock the useAIQuery hook
const mockGenerateSQL = jest.fn();
jest.mock("@/pages/queries/hooks/useAIQuery", () => {
  return jest.fn(() => ({
    generateSQL: mockGenerateSQL,
    sql: null,
    explanation: null,
    tablesUsed: [],
    loading: false,
    error: null,
    refused: false,
    conversation: [],
    generationTimeMs: null,
    provider: null,
  }));
});

// Suppress antd icon warnings in test
jest.mock("@ant-design/icons", () => ({
  ThunderboltOutlined: () => <span data-testid="thunder-icon" />,
  SendOutlined: () => <span data-testid="send-icon" />,
  LoadingOutlined: () => <span data-testid="loading-icon" />,
}));

jest.mock("antd", () => ({
  Tag: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

describe("AIQueryBar", () => {
  const defaultProps = {
    dataSourceId: 1,
    onSQLGenerated: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the input and submit button", () => {
    const wrapper = mount(<AIQueryBar {...defaultProps} />);
    expect(wrapper.find(".ai-query-bar__input")).toHaveLength(1);
    expect(wrapper.find(".ai-query-bar__submit")).toHaveLength(1);
  });

  it("disables input and button when disabled prop is true", () => {
    const wrapper = mount(<AIQueryBar {...defaultProps} disabled />);
    expect(wrapper.find(".ai-query-bar__input").prop("disabled")).toBe(true);
  });

  it("disables submit button when input is empty", () => {
    const wrapper = mount(<AIQueryBar {...defaultProps} />);
    expect(wrapper.find(".ai-query-bar__submit").prop("disabled")).toBe(true);
  });

  it("enables submit button when input has text", () => {
    const wrapper = mount(<AIQueryBar {...defaultProps} />);
    wrapper.find(".ai-query-bar__input").simulate("change", {
      target: { value: "Show me revenue" },
    });
    expect(wrapper.find(".ai-query-bar__submit").prop("disabled")).toBe(false);
  });

  it("calls generateSQL on submit", () => {
    mockGenerateSQL.mockResolvedValue({ sql: "SELECT 1", refused: false });
    const wrapper = mount(<AIQueryBar {...defaultProps} />);
    wrapper.find(".ai-query-bar__input").simulate("change", {
      target: { value: "Show me revenue" },
    });
    wrapper.find(".ai-query-bar__submit").simulate("click");
    expect(mockGenerateSQL).toHaveBeenCalledWith("Show me revenue");
  });

  it("calls generateSQL on Enter key", () => {
    mockGenerateSQL.mockResolvedValue({ sql: "SELECT 1", refused: false });
    const wrapper = mount(<AIQueryBar {...defaultProps} />);
    wrapper.find(".ai-query-bar__input").simulate("change", {
      target: { value: "Show me revenue" },
    });
    wrapper.find(".ai-query-bar__input").simulate("keydown", {
      key: "Enter",
      shiftKey: false,
      preventDefault: jest.fn(),
    });
    expect(mockGenerateSQL).toHaveBeenCalledWith("Show me revenue");
  });

  it("does not submit on Shift+Enter", () => {
    const wrapper = mount(<AIQueryBar {...defaultProps} />);
    wrapper.find(".ai-query-bar__input").simulate("change", {
      target: { value: "Show me revenue" },
    });
    wrapper.find(".ai-query-bar__input").simulate("keydown", {
      key: "Enter",
      shiftKey: true,
      preventDefault: jest.fn(),
    });
    expect(mockGenerateSQL).not.toHaveBeenCalled();
  });
});
