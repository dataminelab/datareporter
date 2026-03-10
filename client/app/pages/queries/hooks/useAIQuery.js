import { useState, useCallback, useRef } from "react";
import AIQuery from "@/services/ai-query";

const MAX_CONVERSATION_LENGTH = 3;

export default function useAIQuery(dataSourceId) {
  const [sql, setSQL] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [tablesUsed, setTablesUsed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refused, setRefused] = useState(false);
  const [provider, setProvider] = useState(null);
  const [model, setModel] = useState(null);
  const [generationTimeMs, setGenerationTimeMs] = useState(null);
  const conversationRef = useRef([]);

  const clearResult = useCallback(() => {
    setSQL(null);
    setExplanation(null);
    setTablesUsed([]);
    setError(null);
    setRefused(false);
    setProvider(null);
    setModel(null);
    setGenerationTimeMs(null);
  }, []);

  const generateSQL = useCallback(
    async (question) => {
      if (!question || !question.trim()) return;

      setLoading(true);
      setError(null);
      setRefused(false);

      try {
        const payload = {
          question: question.trim(),
          data_source_id: dataSourceId,
        };

        if (conversationRef.current.length > 0) {
          payload.conversation = conversationRef.current;
        }

        const response = await AIQuery.generate(payload);
        const data = response;

        setSQL(data.sql);
        setExplanation(data.explanation);
        setTablesUsed(data.tables_used || []);
        setProvider(data.provider || null);
        setModel(data.model || null);
        setGenerationTimeMs(data.generation_time_ms || null);
        setRefused(!!data.refused);

        if (data.sql && !data.refused) {
          const entry = { question: question.trim(), sql: data.sql };
          conversationRef.current = [
            ...conversationRef.current.slice(-(MAX_CONVERSATION_LENGTH - 1)),
            entry,
          ];
        }

        return data;
      } catch (err) {
        let message = "Failed to generate SQL. Please try again.";

        if (err.response) {
          const status = err.response.status;
          const detail = err.response.data?.message || err.response.data?.error;

          if (status === 429) {
            message = "Rate limit reached. Please wait a moment before trying again.";
          } else if (status === 400) {
            message = detail || "Invalid request. Please rephrase your question.";
          } else if (status === 403) {
            message = "AI query is not available for this data source.";
          } else if (status === 500) {
            message = detail || "Server error generating SQL. Please try again.";
          } else if (detail) {
            message = detail;
          }
        }

        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [dataSourceId]
  );

  return {
    generateSQL,
    clearResult,
    sql,
    explanation,
    tablesUsed,
    loading,
    error,
    refused,
    conversation: conversationRef.current,
    provider,
    model,
    generationTimeMs,
  };
}
