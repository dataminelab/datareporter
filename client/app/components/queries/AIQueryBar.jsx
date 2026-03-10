import React, { useState, useCallback } from "react";
import {
  ThunderboltOutlined,
  SendOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";
import useAIQuery from "@/pages/queries/hooks/useAIQuery";
import "./AIQueryBar.less";

export default function AIQueryBar({ dataSourceId, onSQLGenerated, disabled }) {
  const [question, setQuestion] = useState("");
  const {
    generateSQL,
    sql,
    explanation,
    tablesUsed,
    loading,
    error,
    refused,
    conversation,
    generationTimeMs,
    provider,
  } = useAIQuery(dataSourceId);

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || loading || disabled) return;

    const result = await generateSQL(question);
    if (result && result.sql && !result.refused && onSQLGenerated) {
      onSQLGenerated(result.sql);
    }
  }, [question, loading, disabled, generateSQL, onSQLGenerated]);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const hasConversation = conversation && conversation.length > 0;

  return (
    <div className={`ai-query-bar${loading ? " ai-query-bar--loading" : ""}`}>
      <div className="ai-query-bar__row">
        <ThunderboltOutlined className="ai-query-bar__icon" />
        <input
          className="ai-query-bar__input"
          type="text"
          placeholder="Ask about your data... (Enter to generate)"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || disabled}
        />
        {hasConversation && (
          <span className="ai-query-bar__badge">Follow-up</span>
        )}
        <button
          className="ai-query-bar__submit"
          onClick={handleSubmit}
          disabled={loading || disabled || !question.trim()}
        >
          {loading ? <LoadingOutlined /> : <SendOutlined />}
        </button>
      </div>

      {error && <div className="ai-query-bar__error">{error}</div>}

      {generationTimeMs && !error && !loading && (
        <div className="ai-query-bar__meta">
          Generated in {generationTimeMs}ms via {provider}
        </div>
      )}

      {explanation && !error && (
        <div className="ai-query-bar__result">
          {explanation}
          {tablesUsed.length > 0 && (
            <span className="ai-query-bar__tables">
              {tablesUsed.map(table => (
                <Tag key={table} className="ai-query-bar__tag">
                  {table}
                </Tag>
              ))}
            </span>
          )}
        </div>
      )}

      {refused && !error && (
        <div className="ai-query-bar__error">
          This question was declined. Please try rephrasing.
        </div>
      )}
    </div>
  );
}
