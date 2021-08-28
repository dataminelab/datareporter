import { isNil, isObject, extend, keys, map, omit, pick, uniq, get } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Report } from "@/services/report";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

class SaveReportError extends Error {
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

function doSaveReport(data, { canOverwrite = false } = {}) {
  // omit parameter properties that don't need to be stored
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
    }
    return Promise.reject(new SaveReportError("Report could not be saved"));
  });
}

export default function useUpdateReport(report, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(
    (data = null, { successMessage = "Report saved" } = {}) => {
      if (isObject(data)) {
        // Don't save new report with partial data
        if (report.isNew()) {
          handleChange(extend(report.clone(), data));
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
          "model",
          "appSettings",
          "timekeeper",
          "data_source_id",
          "options",
          "latest_query_data_id",
          "is_draft",
        ]);
      }

      return doSaveReport(data, { canOverwrite: report.can_edit })
        .then(updatedReport => {
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
        .catch(error => {
          const notificationOptions = {};
          if (error instanceof SaveReportConflictError) {
            notificationOptions.duration = null;
          }
          notification.error(error.message, error.detailedMessage, notificationOptions);
        });
    },
    [report, handleChange]
  );
}
