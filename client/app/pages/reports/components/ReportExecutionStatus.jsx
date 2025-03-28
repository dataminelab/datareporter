import { includes } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import Alert from "antd/lib/alert";
import Button from "antd/lib/button";
import Timer from "@/components/Timer";

export default function ReportExecutionStatus({ status, updatedAt, error, isCancelling, onCancel }) {
  const alertType = status === "failed" ? "error" : "info";
  const showTimer = status !== "failed" && updatedAt;
  const isCancelButtonAvailable = includes(["waiting", "processing"], status);
  let message = isCancelling ? <React.Fragment>Cancelling&hellip;</React.Fragment> : null;

  switch (status) {
    case "waiting":
      if (!isCancelling) {
        message = <React.Fragment>Report in queue&hellip;</React.Fragment>;
      }
      break;
    case "processing":
      if (!isCancelling) {
        message = <React.Fragment>Executing report&hellip;</React.Fragment>;
      }
      break;
    case "loading-result":
      message = <React.Fragment>Loading results&hellip;</React.Fragment>;
      break;
    case "failed":
      message = (
        <React.Fragment>
          Error running report: <strong>{error}</strong>
        </React.Fragment>
      );
      break;
    // no default
  }

  return (
    <Alert
      data-test="ReportExecutionStatus"
      type={alertType}
      message={
        <div className="d-flex align-items-center">
          <div className="flex-fill p-t-5 p-b-5">
            {message} {showTimer && <Timer from={updatedAt} />}
          </div>
          <div>
            {isCancelButtonAvailable && (
              <Button className="m-l-10" type="primary" size="small" disabled={isCancelling} onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      }
    />
  );
}

ReportExecutionStatus.propTypes = {
  status: PropTypes.string,
  updatedAt: PropTypes.any,
  error: PropTypes.string,
  isCancelling: PropTypes.bool,
  onCancel: PropTypes.func,
};

ReportExecutionStatus.defaultProps = {
  status: "waiting",
  updatedAt: null,
  error: null,
  isCancelling: true,
  onCancel: () => {},
};
