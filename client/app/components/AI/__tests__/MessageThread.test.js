import React from "react";
import { render, fireEvent } from "@testing-library/react";
import MessageThread from "../MessageThread";

describe("MessageThread", () => {
  const messages = [
    { role: "user", content: "Show me users" },
    { role: "assistant", content: "Here is the query for users." },
    { role: "user", content: "Now show orders" },
    { role: "assistant", content: "Here are the orders.", isError: false },
  ];

  test("renders all messages", () => {
    const { container } = render(
      <MessageThread messages={messages} activeIndex={1} onSelectMessage={() => {}} />
    );
    const userMessages = container.querySelectorAll(".ai-message-user");
    const aiMessages = container.querySelectorAll(".ai-message-ai");

    expect(userMessages.length).toBe(2);
    expect(aiMessages.length).toBe(2);
  });

  test("displays user message content", () => {
    const { getByText } = render(
      <MessageThread messages={messages} activeIndex={1} onSelectMessage={() => {}} />
    );
    expect(getByText("Show me users")).toBeTruthy();
    expect(getByText("Now show orders")).toBeTruthy();
  });

  test("displays AI message content", () => {
    const { getByText } = render(
      <MessageThread messages={messages} activeIndex={1} onSelectMessage={() => {}} />
    );
    expect(getByText("Here is the query for users.")).toBeTruthy();
    expect(getByText("Here are the orders.")).toBeTruthy();
  });

  test("highlights active AI message", () => {
    const { container } = render(
      <MessageThread messages={messages} activeIndex={1} onSelectMessage={() => {}} />
    );
    const activeMessages = container.querySelectorAll(".ai-message-active");
    expect(activeMessages.length).toBe(1);
  });

  test("calls onSelectMessage when AI message clicked", () => {
    const onSelectMessage = jest.fn();
    const { container } = render(
      <MessageThread messages={messages} activeIndex={1} onSelectMessage={onSelectMessage} />
    );
    const aiMessages = container.querySelectorAll(".ai-message-ai");
    fireEvent.click(aiMessages[1]); // Click second AI message (index 3)

    expect(onSelectMessage).toHaveBeenCalledWith(3);
  });

  test("returns null for empty messages", () => {
    const { container } = render(
      <MessageThread messages={[]} activeIndex={-1} onSelectMessage={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("shows error styling for error messages", () => {
    const errorMessages = [
      { role: "user", content: "Bad query" },
      { role: "assistant", content: "Failed", isError: true },
    ];
    const { container } = render(
      <MessageThread messages={errorMessages} activeIndex={1} onSelectMessage={() => {}} />
    );
    const errorBubble = container.querySelector(".ai-message-error");
    expect(errorBubble).toBeTruthy();
  });

  test("shows user label 'You'", () => {
    const { getAllByText } = render(
      <MessageThread messages={messages} activeIndex={1} onSelectMessage={() => {}} />
    );
    expect(getAllByText("You").length).toBe(2);
  });
});
