import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  BarChartOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Model from "@/services/model";
import "./OLAPExplorerPanel.less";

/**
 * Inline OLAP explorer panel. Creates an ephemeral model from the current
 * query and embeds Turnilo in an iframe for interactive exploration.
 */
export default function OLAPExplorerPanel({ query }) {
  const [modelId, setModelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const createAndExplore = useCallback(() => {
    if (!query.id || !query.data_source_id || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    Model.createEphemeral({
      query_id: query.id,
      data_source_id: query.data_source_id,
    })
      .then(response => {
        if (!cancelledRef.current) {
          setModelId(response.id);
        }
      })
      .catch(err => {
        if (!cancelledRef.current) {
          const msg =
            err?.response?.data?.message || "Failed to create OLAP model";
          setError(msg.length > 200 ? msg.slice(0, 200) + "..." : msg);
        }
      })
      .finally(() => {
        loadingRef.current = false;
        if (!cancelledRef.current) {
          setLoading(false);
        }
      });
  }, [query.id, query.data_source_id]);

  // Auto-create model on mount
  useEffect(() => {
    if (
      query.id &&
      query.data_source_id &&
      !modelId &&
      !loadingRef.current &&
      !error
    ) {
      createAndExplore();
    }
  }, [query.id, query.data_source_id, createAndExplore, modelId, error]);

  if (loading) {
    return (
      <div className="olap-explorer-panel olap-explorer-panel--loading">
        <LoadingOutlined className="olap-explorer-panel__icon" />
        <span>Creating OLAP model...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="olap-explorer-panel olap-explorer-panel--error">
        <span className="olap-explorer-panel__error-text">{error}</span>
        <button
          className="olap-explorer-panel__retry"
          onClick={createAndExplore}
        >
          <ReloadOutlined /> Retry
        </button>
      </div>
    );
  }

  if (!query.id) {
    return (
      <div className="olap-explorer-panel olap-explorer-panel--empty">
        <BarChartOutlined className="olap-explorer-panel__icon" />
        <span>Save the query first to explore in OLAP.</span>
      </div>
    );
  }

  if (modelId) {
    return (
      <div className="olap-explorer-panel olap-explorer-panel--active">
        <iframe
          src="/report"
          title="OLAP Explorer"
          className="olap-explorer-panel__iframe"
        />
      </div>
    );
  }

  return null;
}

OLAPExplorerPanel.propTypes = {
  query: PropTypes.object.isRequired,
};
