import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { find, orderBy } from "lodash";
import useMedia from "use-media";
import Tabs from "antd/lib/tabs";
import VisualizationRenderer from "@/components/visualizations/VisualizationRenderer";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";

import "./ReportVisualizationTabs.less";

const { TabPane } = Tabs;

function EmptyState({ title, message, refreshButton }) {
  return (
    <div className="report-results-empty-state">
      <div className="empty-state-content">
        <div>
          <img src="/static/images/illustrations/no-report-results.svg" alt="No Report Results Illustration" />
        </div>
        <h3>{title}</h3>
        <div className="m-b-20">{message}</div>
        {refreshButton}
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  refreshButton: PropTypes.node,
};

EmptyState.defaultProps = {
  refreshButton: null,
};

function TabWithDeleteButton({ visualizationName, canDelete, onDelete, ...props }) {
  const handleDelete = useCallback(
    e => {
      e.stopPropagation();
      Modal.confirm({
        title: "Delete Visualization",
        content: "Are you sure you want to delete this visualization?",
        okText: "Delete",
        okType: "danger",
        onOk: onDelete,
        maskClosable: true,
        autoFocusButton: null,
      });
    },
    [onDelete]
  );

  return (
    <span {...props}>
      {visualizationName}
      {canDelete && (
        <a className="delete-visualization-button" onClick={handleDelete}>
          <i className="zmdi zmdi-close" />
        </a>
      )}
    </span>
  );
}

TabWithDeleteButton.propTypes = {
  visualizationName: PropTypes.string.isRequired,
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
};
TabWithDeleteButton.defaultProps = { canDelete: false, onDelete: () => {} };

const defaultVisualizations = [
  {
    type: "TABLE",
    name: "Table",
    id: null,
    options: {},
  },
];

export default function ReportVisualizationTabs({
  queryResult,
  selectedTab,
  showNewVisualizationButton,
  canDeleteVisualizations,
  onChangeTab,
  onAddVisualization,
  onDeleteVisualization,
  refreshButton,
  ...props
}) {
  const visualizations = useMemo(
    () => (props.visualizations.length > 0 ? props.visualizations : defaultVisualizations),
    [props.visualizations]
  );

  const tabsProps = {};
  if (find(visualizations, { id: selectedTab })) {
    tabsProps.activeKey = `${selectedTab}`;
  }

  if (showNewVisualizationButton) {
    tabsProps.tabBarExtraContent = (
      <Button
        className="add-visualization-button"
        data-test="NewVisualization"
        type="link"
        onClick={() => onAddVisualization()}>
        <i className="fa fa-plus" />
        <span className="m-l-5 hidden-xs">Add Visualization</span>
      </Button>
    );
  }

  const orderedVisualizations = useMemo(() => orderBy(visualizations, ["id"]), [visualizations]);
  const isFirstVisualization = useCallback(visId => visId === orderedVisualizations[0].id, [orderedVisualizations]);
  const isMobile = useMedia({ maxWidth: 768 });

  return (
    <Tabs
      {...tabsProps}
      type="card"
      className={cx("report-visualization-tabs card-style")}
      data-test="ReportPageVisualizationTabs"
      animated={false}
      tabBarGutter={0}
      onChange={activeKey => onChangeTab(+activeKey)}
      destroyInactiveTabPane>
      {orderedVisualizations.map(visualization => (
        <TabPane
          key={`${visualization.id}`}
          data-test={`ReportPageVisualization${selectedTab}`}
          tab={
            <TabWithDeleteButton
              data-test={`ReportPageVisualizationTab${visualization.id}`}
              canDelete={!isMobile && canDeleteVisualizations && !isFirstVisualization(visualization.id)}
              visualizationName={visualization.name}
              onDelete={() => onDeleteVisualization(visualization.id)}
            />
          }>
          {queryResult ? (
            <VisualizationRenderer visualization={visualization} queryResult={queryResult} context="report" />
          ) : (
            <EmptyState
              title="Report Has no Result"
              message="Execute/Refresh the report to show results."
              refreshButton={refreshButton}
            />
          )}
        </TabPane>
      ))}
    </Tabs>
  );
}

ReportVisualizationTabs.propTypes = {
  queryResult: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  visualizations: PropTypes.arrayOf(PropTypes.object),
  selectedTab: PropTypes.number,
  showNewVisualizationButton: PropTypes.bool,
  canDeleteVisualizations: PropTypes.bool,
  onChangeTab: PropTypes.func,
  onAddVisualization: PropTypes.func,
  onDeleteVisualization: PropTypes.func,
  refreshButton: PropTypes.node,
};

ReportVisualizationTabs.defaultProps = {
  queryResult: null,
  visualizations: [],
  selectedTab: null,
  showNewVisualizationButton: false,
  canDeleteVisualizations: false,
  onChangeTab: () => {},
  onAddVisualization: () => {},
  onDeleteVisualization: () => {},
  refreshButton: null,
};
