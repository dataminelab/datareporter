import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Tabs from "antd/lib/tabs";
import Button from "antd/lib/button";
import Table from "antd/lib/table";
import Spin from "antd/lib/spin";

import "./ResultsPanel.less";

const { TabPane } = Tabs;

function SQLView({ sql }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [sql]);

  return (
    <div className="ai-sql-view">
      <div className="ai-sql-actions">
        <Button size="small" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <pre className="ai-sql-code">
        <code>{sql}</code>
      </pre>
    </div>
  );
}

SQLView.propTypes = {
  sql: PropTypes.string.isRequired,
};

function ResultsTable({ data }) {
  if (!data || !data.columns || !data.rows) {
    return <div className="ai-results-empty">No results to display.</div>;
  }

  const columns = data.columns.map((col) => ({
    title: col.friendly_name || col.name,
    dataIndex: col.name,
    key: col.name,
    sorter: (a, b) => {
      const aVal = a[col.name];
      const bVal = b[col.name];
      if (typeof aVal === "number" && typeof bVal === "number") return aVal - bVal;
      return String(aVal || "").localeCompare(String(bVal || ""));
    },
    ellipsis: true,
  }));

  const dataSource = data.rows.map((row, index) => ({
    ...row,
    key: index,
  }));

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      size="small"
      scroll={{ x: true }}
      pagination={{
        pageSize: 50,
        showSizeChanger: true,
        showTotal: (total) => `${total} rows`,
      }}
    />
  );
}

ResultsTable.propTypes = {
  data: PropTypes.shape({
    columns: PropTypes.array,
    rows: PropTypes.array,
  }),
};

ResultsTable.defaultProps = {
  data: null,
};

function downloadCSV(data, filename) {
  if (!data || !data.columns || !data.rows) return;

  const headers = data.columns.map((c) => c.name);
  const csvRows = [
    headers.join(","),
    ...data.rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename || "query_results.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function ResultsPanel({
  sql,
  explanation,
  queryResult,
  executionTime,
  isLoading,
  error,
  onRetry,
  onExecute,
  title,
}) {
  const handleDownload = useCallback(() => {
    downloadCSV(queryResult, `ai_query_${Date.now()}.csv`);
  }, [queryResult]);

  if (isLoading) {
    return (
      <div className="ai-results-panel ai-results-loading">
        <Spin size="large" />
        <p className="ai-loading-text">Generating query...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-results-panel ai-results-error">
        <div className="ai-error-icon">&#9888;</div>
        <h3>{error.title || "Query Error"}</h3>
        <p>{error.message}</p>
        {error.details && <pre className="ai-error-details">{error.details}</pre>}
        <div className="ai-error-actions">
          {onRetry && (
            <Button onClick={onRetry} icon="redo">
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!sql) {
    return null;
  }

  return (
    <div className="ai-results-panel">
      {title && (
        <div className="ai-results-header">
          <h3 className="ai-results-title">{title}</h3>
          {executionTime && (
            <span className="ai-results-time">Ran in {executionTime}s</span>
          )}
        </div>
      )}

      {explanation && (
        <p className="ai-results-explanation">{explanation}</p>
      )}

      <Tabs defaultActiveKey="results" className="ai-results-tabs">
        <TabPane tab="Results" key="results">
          {queryResult ? (
            <ResultsTable data={queryResult} />
          ) : (
            <div className="ai-results-review">
              <p>Review the generated SQL and click Execute to run it.</p>
              <Button type="primary" onClick={onExecute} className="ai-execute-button">
                Execute Query
              </Button>
            </div>
          )}
        </TabPane>
        <TabPane tab="SQL" key="sql">
          <SQLView sql={sql} />
        </TabPane>
      </Tabs>

      <div className="ai-results-footer">
        {queryResult && (
          <Button onClick={handleDownload} icon="download">
            Download CSV
          </Button>
        )}
        {onRetry && (
          <Button onClick={onRetry} icon="redo">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

ResultsPanel.propTypes = {
  sql: PropTypes.string,
  explanation: PropTypes.string,
  queryResult: PropTypes.object,
  executionTime: PropTypes.number,
  isLoading: PropTypes.bool,
  error: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
    details: PropTypes.string,
  }),
  onRetry: PropTypes.func,
  onExecute: PropTypes.func,
  title: PropTypes.string,
};

ResultsPanel.defaultProps = {
  sql: "",
  explanation: "",
  queryResult: null,
  executionTime: null,
  isLoading: false,
  error: null,
  onRetry: null,
  onExecute: null,
  title: "",
};
