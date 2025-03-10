import { extend } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Report } from "@/services/report";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

function confirmDelete() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "Delete Report",
      content: (
        <React.Fragment>
          <div className="m-b-5">Are you sure you want to delete this report?</div>
          <div>All alerts and dashboard widgets created with its visualizations will be deleted.</div>
        </React.Fragment>
      ),
      okText: "Delete",
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

function doDeleteReport(report) {
  return Report.delete({ id: report.id })
    .then(() => {
      notification.success("Report deleted.");

      // Also clear saved meta price data
      localStorage.removeItem(`${window.location.pathname}-proceed_data`);
      localStorage.removeItem(`${window.location.pathname}-price`);

      return extend(report.clone(), { is_deleted: true, schedule: null });
    })
    .catch(error => {
      notification.error("Report could not be deleted.");
      return Promise.reject(error);
    });
}

export default function useDeleteReport(report, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(() => {
    confirmDelete()
      .then(() => doDeleteReport(report))
      .then(handleChange)
      .catch(() => {console.log("Delete report cancelled")});
  }, [report, handleChange]);
}
