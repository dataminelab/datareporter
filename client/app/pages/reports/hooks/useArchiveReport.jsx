import { extend } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Report } from "@/services/report";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

function confirmArchive() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "Archive Report",
      content: (
        <React.Fragment>
          <div className="m-b-5">Are you sure you want to archive this report?</div>
          <div>All alerts and dashboard widgets created with its visualizations will be deleted.</div>
        </React.Fragment>
      ),
      okText: "Archive",
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

function doArchiveReport(report) {
  return Report.archiveReport({ id: report.id })
    .then(() => {
      notification.success("Report archived.");
      return extend(report.clone(), { is_archived: true, schedule: null });
    })
    .catch(error => {
      notification.error("Report could not be archived.");
      return Promise.reject(error);
    });
}

export default function useArchiveReport(report, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(() => {
    confirmArchive()
      .then(() => doArchiveReport(report))
      .then(handleChange);
  }, [report, handleChange]);
}
