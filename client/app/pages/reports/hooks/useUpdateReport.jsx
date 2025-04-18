import { isNil, isObject, extend, keys, map, omit, pick, uniq, get } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Report } from "@/services/report";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export class SaveReportError extends Error {
  constructor(message, detailedMessage = null) {
    super(message);
    this.detailedMessage = detailedMessage;
  }
}

class SaveReportConflictError extends SaveReportError {
  constructor() {
    super(
      "Changes not saved",
      <React.Fragment>
        <div className="m-b-5">It seems like the report has been modified by another user.</div>
        <div>Please copy/backup your changes and reload this page.</div>
      </React.Fragment>
    );
  }
}

function confirmOverwrite() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "Overwrite Report",
      content: (
        <React.Fragment>
          <div className="m-b-5">It seems like the report has been modified by another user.</div>
          <div>Are you sure you want to overwrite the report with your version?</div>
        </React.Fragment>
      ),
      okText: "Overwrite",
      okType: "danger",
      onOk: () => {
        resolve();
      },
      onCancel: () => {
        reject();
      },
      maskClosable: true,
      autoFocusButton: null,
    });
  });
}

function showNotification(error) {
  const notificationOptions = {};
  if (error instanceof SaveReportConflictError) {
    notificationOptions.duration = null;
  }
  if (!error || error.message === 'No changes made') return;
  notification.error(error.message, error.detailedMessage, notificationOptions);
}

function doSaveReport(data, { canOverwrite = false, errorMessage = "Report could not be saved" } = {}) {
  if (isObject(data.options) && data.options.parameters) {
    data.options = {
      ...data.options,
      parameters: map(data.options.parameters, p => p.toSaveableObject()),
    };
  }

  return Report.save(data).catch(error => {
    if (get(error, "response.status") === 409) {
      if (canOverwrite) {
        return confirmOverwrite()
          .then(() => Report.save(omit(data, ["version"])))
          .catch(() => Promise.reject(new SaveReportConflictError()));
      }
      return Promise.reject(new SaveReportConflictError());
    } else if (get(error, "response.status") === 400) {
      let message = get(error, "response.data.message")
      return Promise.reject(new SaveReportError(message));
    }
    if (error.name == "TypeError") {
      return Promise.reject();
    }
    if (errorMessage) return Promise.reject(new SaveReportError(errorMessage));
    return Promise.reject();
  });
}

export default function useUpdateReport(report, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(
    (data = null, { successMessage = "Report saved", errorMessage = "Report could not be saved" } = {}) => {
      if (isObject(data)) {
        // Don't save new report with partial data
        if (report.isNew && report.isNew()) {
          handleChange(extend(report.clone(), data));
          if (errorMessage) {
            const error = new SaveReportError(errorMessage);
            showNotification(error);
          }
          return;
        }
        data = { ...data, id: report.id, version: report.version };
      } else {
        data = pick(report, [
          "id",
          "version",
          "schedule",
          "report",
          "description",
          "name",
          "model_id",
          "appSettings",
          "timekeeper",
          "data_source_id",
          "options",
          "latest_query_data_id",
          "is_draft",
          "color_1",
          "color_2",
          "expression",
        ]);
      }
      if (!report.expression && !report.hash) return 0;
      return doSaveReport(data, { canOverwrite: report.can_edit, errorMessage: errorMessage })
        .then(updatedReport => {
          if (!updatedReport || updatedReport.message === 'No changes made') return;
          if (!isNil(successMessage)) {
            notification.success(successMessage);
          }
          handleChange(
            extend(
              report.clone(),
              // if server returned completely new object (currently possible only when saving new report) -
              // update all fields; otherwise pick only changed fields
              updatedReport.id !== report.id ? updatedReport : pick(updatedReport, uniq(["id", "version", ...keys(data)]))
            )
          );
        })
        .catch(error => showNotification(error));
    },
    [report, handleChange]
  );
}
