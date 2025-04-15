import { map, groupBy, find, first } from "lodash";
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import Modal from "antd/lib/modal";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import ReportSelector from "@/components/ReportSelector";
import notification from "@/services/notification";
import { Report } from "@/services/report";

const PREDEFINED_GROUPS = [
  {
    created_at: "2024-05-10T14:27:17.589Z",
    description: "no visualisation to be used",
    id: 0,
    name: "Table",
    options: {},
    type: "TABLE",
    updated_at: "2024-05-10T14:27:41.789Z",
  },
  {
    created_at: "2024-05-10T14:27:17.589Z",
    description: "See the selected daterange for selected reports in the dashboard",
    id: -1,
    name: "Turnilo",
    options: {},
    type: "TURNILO",
    updated_at: "2024-05-10T14:27:41.789Z",
  }
]

function VisualizationSelect({ report, visualization, onChange }) {
  const visualizationGroups = useMemo(() => {
    return report ? groupBy(PREDEFINED_GROUPS, "type") : {};
  }, [report]);

  const handleChange = useCallback(
    visualizationId => {
      const selectedVisualization = report ? find(PREDEFINED_GROUPS, { id: visualizationId }) : null;
      onChange(selectedVisualization || null);
    },
    [report, onChange]
  );

  if (!report) {
    return null;
  }

  return (
    <div>
      <div className="form-group">
        <label htmlFor="choose-visualization">Choose Visualization</label>
        <Select
          id="choose-visualization"
          className="w-100"
          value={visualization ? visualization.id : undefined}
          onChange={handleChange}
        >
          {map(visualizationGroups, (visualizations, groupKey) => (
            <Select.OptGroup key={groupKey} label={groupKey}>
              {map(visualizations, visualization => (
                <Select.Option key={`${visualization.id}`} value={visualization.id}>
                  {visualization.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </div>
    </div>
  );
}

VisualizationSelect.propTypes = {
  report: PropTypes.object,
  visualization: PropTypes.object,
  onChange: PropTypes.func,
};

VisualizationSelect.defaultProps = {
  report: null,
  visualization: null,
  onChange: () => {},
};

function AddReportDialog({ dialog, dashboard }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const [parameterMappings, setParameterMappings] = useState([]);

  const selectReport = useCallback(
    reportId => {
      // Clear previously selected report (if any)
      setSelectedReport(null);
      setSelectedVisualization(null);
      setParameterMappings([]);

      if (reportId) {
        Report.get({ id: reportId }).then(report => {
          if (report) {
            setSelectedReport(report);
            setParameterMappings({
              turnilo_daterange: {
                mapTo:"turnilo_daterange",
                name:"turnilo_default_daterange",
                title: "DEFAULT TURNILO FILTER",
                type: "turnilo",
                name: "turnilo_daterange",
              }
            });
            setSelectedVisualization(first(PREDEFINED_GROUPS));
          }
        });
      }
    },
    []
  );

  const saveWidget = useCallback(() => {
    const options = {
      parameterMappings: parameterMappings,
      type: selectedVisualization.type,
      description: selectedVisualization.description,
      id: selectedVisualization.id,
    }
    dialog.close({ text: `[turnilo-widget]${selectedReport.id}/4/${selectedReport.hash}`, options })
      .then(() => {
        notification.success("Report Widget added to dashboard.");
      })    
      .catch(() => {
        notification.error("Report Widget could not be added");
      });
  }, [dialog, parameterMappings, selectedReport.hash, selectedReport.id, selectedVisualization.description, selectedVisualization.id, selectedVisualization.type]);

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
      width={700}
    >
      <div data-test="AddReportDialog">
        <ReportSelector onChange={report => selectReport(report ? report.id : null)} />

        {selectedReport && (
          <VisualizationSelect
            report={selectedReport}
            visualization={selectedVisualization}
            onChange={setSelectedVisualization}
          />
        )}
      </div>
    </Modal>
  );
}

AddReportDialog.propTypes = {
  dialog: DialogPropType.isRequired,
  dashboard: PropTypes.object.isRequired,
};

export default wrapDialog(AddReportDialog);
