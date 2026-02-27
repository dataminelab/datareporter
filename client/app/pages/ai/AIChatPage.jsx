import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";

import routes from "@/services/routes";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import aiQueryService from "@/services/aiQuery";
import QueryInput from "@/components/AI/QueryInput";
import MessageThread from "@/components/AI/MessageThread";
import ResultsPanel from "@/components/AI/ResultsPanel";
import EmptyState from "@/components/AI/EmptyState";

import "./AIChatPage.less";

function AIChatPage() {
  // State
  const [messages, setMessages] = useState([]);
  const [results, setResults] = useState({}); // index -> { sql, explanation, queryResult, ... }
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState(null);
  const [configError, setConfigError] = useState(null);
  const abortControllerRef = useRef(null);

  // Load config on mount
  useEffect(() => {
    aiQueryService.getConfig()
      .then((data) => {
        setConfig(data);
        if (data.data_sources && data.data_sources.length > 0) {
          setSelectedDataSourceId(data.data_sources[0].id);
        }
        if (!data.providers || data.providers.length === 0) {
          setConfigError({
            title: "AI provider not configured",
            message: "An admin needs to set up an AI provider in Settings.",
            action: { label: "Go to Settings", href: "data_sources" },
          });
        }
        if (!data.data_sources || data.data_sources.length === 0) {
          setConfigError({
            title: "AI queries need a data source",
            message: "Connect a database to start asking questions.",
            action: { label: "Go to Data Sources Settings", href: "data_sources/new" },
          });
        }
      })
      .catch(() => {
        setConfigError({
          title: "Failed to load AI configuration",
          message: "Please try refreshing the page.",
        });
      });
  }, []);

  const handleSubmit = useCallback(
    (question) => {
      if (!selectedDataSourceId) return;

      setIsLoading(true);

      // Add user message
      const userMsg = { role: "user", content: question };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);

      // Build conversation history for follow-up context
      const conversationHistory = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const provider = config && config.default_provider ? config.default_provider : "openai";

      abortControllerRef.current = new AbortController();

      aiQueryService
        .generateQuery({
          question,
          dataSourceId: selectedDataSourceId,
          provider,
          messages: conversationHistory,
          signal: abortControllerRef.current.signal,
        })
        .then((data) => {
          const aiResponse = {
            role: "assistant",
            content: data.explanation || "Here are the results for your query.",
            isError: !!data.error,
          };

          const updatedMessages = [...newMessages, aiResponse];
          setMessages(updatedMessages);

          const resultIndex = updatedMessages.length - 1;
          setResults((prev) => ({
            ...prev,
            [resultIndex]: {
              sql: data.sql,
              explanation: data.explanation,
              tablesUsed: data.tables_used,
              dataSourceId: data.data_source_id || selectedDataSourceId,
              queryResult: data.query_result || null,
              error: data.error ? { title: "Query Generation Error", message: data.error } : null,
            },
          }));
          setActiveResultIndex(resultIndex);
        })
        .catch((err) => {
          const errorMsg = err.response?.data?.message || err.message || "Something went wrong.";
          const aiResponse = {
            role: "assistant",
            content: `Could not generate a query: ${errorMsg}`,
            isError: true,
          };

          const updatedMessages = [...newMessages, aiResponse];
          setMessages(updatedMessages);

          const resultIndex = updatedMessages.length - 1;
          setResults((prev) => ({
            ...prev,
            [resultIndex]: {
              sql: "",
              explanation: "",
              error: {
                title: "Couldn't generate a query for this question",
                message: errorMsg,
                details: "Try being more specific:\n- Include a metric (revenue, count, average)\n- Mention a time range (last month, this year)\n- Name specific tables or entities",
              },
            },
          }));
          setActiveResultIndex(resultIndex);
        })
        .finally(() => {
          setIsLoading(false);
          abortControllerRef.current = null;
        });
    },
    [messages, selectedDataSourceId, config]
  );

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  const handleSelectMessage = useCallback((index) => {
    if (results[index]) {
      setActiveResultIndex(index);
    }
  }, [results]);

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      handleSubmit(suggestion);
    },
    [handleSubmit]
  );

  const handleExecute = useCallback(() => {
    const result = results[activeResultIndex];
    if (!result || !result.sql) return;

    const dsId = result.dataSourceId || selectedDataSourceId;

    setResults((prev) => ({
      ...prev,
      [activeResultIndex]: { ...prev[activeResultIndex], isExecuting: true },
    }));

    aiQueryService
      .executeQuery(dsId, result.sql)
      .then((data) => {
        if (data.job) {
          // Poll for results
          pollJobResult(data.job.id, activeResultIndex);
        } else if (data.query_result) {
          setResults((prev) => ({
            ...prev,
            [activeResultIndex]: {
              ...prev[activeResultIndex],
              queryResult: data.query_result.data,
              executionTime: data.query_result.runtime,
              isExecuting: false,
            },
          }));
        }
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.message || "Query execution failed.";
        setResults((prev) => ({
          ...prev,
          [activeResultIndex]: {
            ...prev[activeResultIndex],
            isExecuting: false,
            executionError: {
              title: "Query failed to execute",
              message: errorMsg,
            },
          },
        }));
      });
  }, [activeResultIndex, results, selectedDataSourceId]);

  const pollJobResult = useCallback((jobId, resultIndex) => {
    const MAX_POLLS = 120; // 2 minutes at 1s intervals
    let pollCount = 0;

    const poll = () => {
      pollCount += 1;
      if (pollCount > MAX_POLLS) {
        setResults((prev) => ({
          ...prev,
          [resultIndex]: {
            ...prev[resultIndex],
            isExecuting: false,
            executionError: {
              title: "Query timed out",
              message: "The query took too long to execute. Try a simpler query or check the data source.",
            },
          },
        }));
        return;
      }

      aiQueryService
        .getQueryResult(jobId)
        .then((data) => {
          const job = data.job;
          if (job.status === 3) {
            // Success - load the query result
            if (job.query_result_id) {
              // Fetch the actual result data
              import("@/services/axios").then(({ axios }) => {
                axios.get(`/api/query_results/${job.query_result_id}`).then((qr) => {
                  setResults((prev) => ({
                    ...prev,
                    [resultIndex]: {
                      ...prev[resultIndex],
                      queryResult: qr.query_result.data,
                      executionTime: qr.query_result.runtime,
                      isExecuting: false,
                    },
                  }));
                });
              });
            }
          } else if (job.status === 4) {
            // Error
            setResults((prev) => ({
              ...prev,
              [resultIndex]: {
                ...prev[resultIndex],
                isExecuting: false,
                executionError: {
                  title: "Query failed to execute",
                  message: job.error || "Unknown error",
                },
              },
            }));
          } else {
            // Still running - poll again
            setTimeout(poll, 1000);
          }
        })
        .catch(() => {
          setResults((prev) => ({
            ...prev,
            [resultIndex]: {
              ...prev[resultIndex],
              isExecuting: false,
              executionError: {
                title: "Query failed to execute",
                message: "Failed to check query status.",
              },
            },
          }));
        });
    };
    poll();
  }, []);

  const handleRetry = useCallback(() => {
    // Find the last user message and resubmit
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        handleSubmit(messages[i].content);
        break;
      }
    }
  }, [messages, handleSubmit]);

  // Get current active result
  const activeResult = results[activeResultIndex] || {};
  const hasMessages = messages.length > 0;
  const isDisabled = !selectedDataSourceId || !!configError;

  return (
    <div className="ai-chat-page">
      <div className="ai-conversation-panel">
        {hasMessages ? (
          <MessageThread
            messages={messages}
            activeIndex={activeResultIndex}
            onSelectMessage={handleSelectMessage}
          />
        ) : (
          <div className="ai-conversation-empty" />
        )}
        <QueryInput
          onSubmit={handleSubmit}
          onStop={handleStop}
          isLoading={isLoading}
          disabled={isDisabled}
        />
      </div>

      <div className="ai-results-container">
        {hasMessages ? (
          <ResultsPanel
            sql={activeResult.sql}
            explanation={activeResult.explanation}
            queryResult={activeResult.queryResult}
            executionTime={activeResult.executionTime}
            isLoading={isLoading || activeResult.isExecuting}
            error={activeResult.executionError || activeResult.error}
            onRetry={handleRetry}
            onExecute={handleExecute}
            title={activeResult.sql ? "Query Results" : ""}
          />
        ) : (
          <EmptyState
            dataSources={config ? config.data_sources : []}
            selectedDataSourceId={selectedDataSourceId}
            onDataSourceChange={setSelectedDataSourceId}
            onSuggestionClick={handleSuggestionClick}
            configError={configError}
          />
        )}
      </div>
    </div>
  );
}

AIChatPage.propTypes = {
  onError: PropTypes.func,
};

AIChatPage.defaultProps = {
  onError: () => {},
};

routes.register(
  "AI.Chat",
  routeWithUserSession({
    path: "/ai",
    title: "AI",
    render: (pageProps) => <AIChatPage {...pageProps} />,
  })
);

export default AIChatPage;
