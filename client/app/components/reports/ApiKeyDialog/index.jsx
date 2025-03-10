import { extend } from "lodash";
import React, { useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "antd/lib/modal";
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import CodeBlock from "@/components/CodeBlock";
import { axios } from "@/services/axios";
import { clientConfig } from "@/services/auth";
import notification from "@/services/notification";
import { useUniqueId } from "@/lib/hooks/useUniqueId";

import "./index.less";
import { policy } from "@/services/policy";

function ApiKeyDialog({ dialog, ...props }) {
  const [report, setReport] = useState(props.report);
  const [updatingApiKey, setUpdatingApiKey] = useState(false);

  const regenerateReportApiKey = useCallback(() => {
    setUpdatingApiKey(true);
    axios
      .post(`api/reports/${report.id}/regenerate_api_key`)
      .then(data => {
        setUpdatingApiKey(false);
        setReport(extend(report.clone(), { api_key: data.api_key }));
      })
      .catch((e) => {
        console.error(e);
        setUpdatingApiKey(false);
        notification.error("Failed to update API key");
      });
  }, [report]);

  const { csvUrl, jsonUrl } = useMemo(
    () => ({
      csvUrl: `${clientConfig.basePath}api/reports/${report.id}/results.csv?api_key=${report.api_key}`,
      jsonUrl: `${clientConfig.basePath}api/reports/${report.id}/results.json?api_key=${report.api_key}`,
    }),
    [report.id, report.api_key]
  );

  const csvResultsLabelId = useUniqueId("csv-results-label");
  const jsonResultsLabelId = useUniqueId("json-results-label");

  return (
    <Modal {...dialog.props} width={600} footer={<Button onClick={() => dialog.close(report)}>Close</Button>}>
      <div className="report-api-key-dialog-wrapper">
        <h5>API Key</h5>
        <div className="m-b-20">
          <Input.Group compact>
            <Input readOnly value={report.api_key} aria-label="Report API Key" />
            {policy.canEdit(report) && (
              <Button disabled={updatingApiKey} loading={updatingApiKey} onClick={regenerateReportApiKey}>
                Regenerate
              </Button>
            )}
          </Input.Group>
        </div>

        <h5>Example API Calls:</h5>
        <div className="m-b-10">
          <span id={csvResultsLabelId}>Results in CSV format:</span>
          <CodeBlock aria-labelledby={csvResultsLabelId} copyable>
            {csvUrl}
          </CodeBlock>
        </div>
        <div>
          <span id={jsonResultsLabelId}>Results in JSON format:</span>
          <CodeBlock aria-labelledby={jsonResultsLabelId} copyable>
            {jsonUrl}
          </CodeBlock>
        </div>
      </div>
    </Modal>
  );
}

ApiKeyDialog.propTypes = {
  dialog: DialogPropType.isRequired,
  report: PropTypes.shape({
    id: PropTypes.number.isRequired,
    api_key: PropTypes.string,
    can_edit: PropTypes.bool,
  }).isRequired,
};

export default wrapDialog(ApiKeyDialog);
