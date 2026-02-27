import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";

import "./QueryInput.less";

export default function QueryInput({ onSubmit, onStop, isLoading, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, [value, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
    // Auto-expand textarea
    const el = e.target;
    el.style.height = "44px";
    const newHeight = Math.min(el.scrollHeight, 120);
    el.style.height = `${newHeight}px`;
  }, []);

  return (
    <div className="ai-query-input-wrapper">
      <div className="ai-query-input">
        <textarea
          ref={textareaRef}
          className="ai-query-textarea"
          placeholder="Ask about your data..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          rows={1}
        />
        {isLoading ? (
          <button
            className="ai-query-button ai-query-stop"
            onClick={onStop}
            type="button"
            title="Stop"
          >
            <span className="ai-stop-icon">&#9632;</span>
          </button>
        ) : (
          <button
            className="ai-query-button ai-query-submit"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            type="button"
            title="Submit"
          >
            <span className="ai-submit-icon">&#8593;</span>
          </button>
        )}
      </div>
    </div>
  );
}

QueryInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onStop: PropTypes.func,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

QueryInput.defaultProps = {
  onStop: () => {},
  isLoading: false,
  disabled: false,
};
