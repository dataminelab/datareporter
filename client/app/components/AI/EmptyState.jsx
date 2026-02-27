import React from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";

import "./EmptyState.less";

const { Option } = Select;

const DEFAULT_SUGGESTIONS = [
  "Top 10 customers by revenue",
  "Revenue trend over the past 12 months",
  "Orders by status",
  "Daily signups this month",
];

export default function EmptyState({
  dataSources,
  selectedDataSourceId,
  onDataSourceChange,
  onSuggestionClick,
  suggestions,
  configError,
}) {
  const displaySuggestions = suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  if (configError) {
    return (
      <div className="ai-empty-state">
        <div className="ai-empty-icon ai-empty-icon-warning">&#9888;</div>
        <h3>{configError.title}</h3>
        <p>{configError.message}</p>
        {configError.action && (
          <a href={configError.action.href} className="ai-empty-action-link">
            {configError.action.label} &rarr;
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="ai-empty-state">
      <div className="ai-empty-icon">&#10022;</div>
      <h2 className="ai-empty-title">Ask questions about your data in plain English</h2>
      <p className="ai-empty-subtitle">I'll generate SQL queries for you.</p>

      {dataSources && dataSources.length > 0 && (
        <div className="ai-empty-datasource">
          <label className="ai-empty-datasource-label">Data Source:</label>
          <Select
            className="ai-empty-datasource-select"
            value={selectedDataSourceId}
            onChange={onDataSourceChange}
            placeholder="Select a data source"
            style={{ width: 280 }}
          >
            {dataSources.map((ds) => (
              <Option key={ds.id} value={ds.id}>
                {ds.name}
              </Option>
            ))}
          </Select>
        </div>
      )}

      <div className="ai-empty-suggestions">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            className="ai-suggestion-card"
            onClick={() => onSuggestionClick(suggestion)}
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  dataSources: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  selectedDataSourceId: PropTypes.number,
  onDataSourceChange: PropTypes.func,
  onSuggestionClick: PropTypes.func.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  configError: PropTypes.shape({
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    }),
  }),
};

EmptyState.defaultProps = {
  dataSources: [],
  selectedDataSourceId: undefined,
  onDataSourceChange: () => {},
  suggestions: null,
  configError: null,
};
