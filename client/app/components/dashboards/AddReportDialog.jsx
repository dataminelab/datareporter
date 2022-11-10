import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "antd/lib/modal";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import {ParameterMappingListInput} from "@/components/ParameterMappingInput";
import ReportSelector from "@/components/ReportSelector";
import notification from "@/services/notification";
import {Report} from "@/services/report";

function AddReportDialog({ dialog, dashboard }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [parameterMappings, setParameterMappings] = useState([]);

  const selectReport = useCallback(
    reportId => {
      if (selectedReport) {
        setSelectedReport(null);
      }
      if (reportId) {
        Report.get({ id: reportId }).then(report => {
          if (report) {
            setSelectedReport(report);
          }
        });
      }
    },
    [dashboard]
  );

  const saveWidget = useCallback(() => {
    dialog.close(`[turnilo-widget]${selectedReport.id}/4/${selectedReport.hash}`)
      .then(() => {
        notification.success("Report added to dashboard.");
        // set widget's data source to the given one in the dashboard
      })    
      .catch(() => {
        notification.error("Widget could not be added");
      });
  }, [dialog, selectedReport]);

  const existingParams = dashboard.getParametersDefs();

  return (
    <Modal
      {...dialog.props}
      title="Add Report Widget"
      onOk={() => saveWidget()}
      okButtonProps={{
        ...dialog.props.okButtonProps,
        disabled: !selectedReport || dialog.props.okButtonProps.disabled,
      }}
      okText="Add to Dashboard"
      width={700}>
      <div data-test="AddReportDialog">
        <ReportSelector onChange={report => selectReport(report ? report.id : null)} />
        {selectedReport ? selectedReport.id : ''}
        {parameterMappings.length > 0 && [
          <label key="parameters-title" htmlFor="parameter-mappings">
            Parameters
          </label>,
          <ParameterMappingListInput
            key="parameters-list"
            id="parameter-mappings"
            mappings={parameterMappings}
            existingParams={existingParams}
            onChange={setParameterMappings}
          />,
        ]}
      </div>
    </Modal>
  );
}

AddReportDialog.propTypes = {
  dialog: DialogPropType.isRequired,
  dashboard: PropTypes.object.isRequired,
};

export default wrapDialog(AddReportDialog);
