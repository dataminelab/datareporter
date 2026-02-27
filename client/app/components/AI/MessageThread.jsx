import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import "./MessageThread.less";

function UserMessage({ text }) {
  return (
    <div className="ai-message ai-message-user">
      <div className="ai-message-label">You</div>
      <div className="ai-message-bubble ai-message-bubble-user">{text}</div>
    </div>
  );
}

UserMessage.propTypes = {
  text: PropTypes.string.isRequired,
};

function AIMessage({ text, isActive, onClick, isError }) {
  return (
    <div
      className={`ai-message ai-message-ai ${isActive ? "ai-message-active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="ai-message-label">
        <span className="ai-sparkle">&#10022;</span> AI
      </div>
      <div className={`ai-message-bubble ai-message-bubble-ai ${isError ? "ai-message-error" : ""}`}>
        {text}
      </div>
    </div>
  );
}

AIMessage.propTypes = {
  text: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  isError: PropTypes.bool,
};

AIMessage.defaultProps = {
  isActive: false,
  onClick: () => {},
  isError: false,
};

export default function MessageThread({ messages, activeIndex, onSelectMessage }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="ai-message-thread" ref={scrollRef}>
      {messages.map((msg, index) => {
        if (msg.role === "user") {
          return <UserMessage key={index} text={msg.content} />;
        }
        if (msg.role === "assistant") {
          const isActive = index === activeIndex;
          return (
            <AIMessage
              key={index}
              text={msg.content}
              isActive={isActive}
              isError={msg.isError}
              onClick={() => onSelectMessage(index)}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

MessageThread.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.oneOf(["user", "assistant"]).isRequired,
      content: PropTypes.string.isRequired,
      isError: PropTypes.bool,
    })
  ).isRequired,
  activeIndex: PropTypes.number,
  onSelectMessage: PropTypes.func,
};

MessageThread.defaultProps = {
  activeIndex: -1,
  onSelectMessage: () => {},
};
