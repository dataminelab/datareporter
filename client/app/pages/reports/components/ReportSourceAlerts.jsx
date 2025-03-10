import React from "react";
import PropTypes from "prop-types";
import Card from "antd/lib/card";
import WarningFilledIcon from "@ant-design/icons/WarningFilled";
import Typography from "antd/lib/typography";
import Link from "@/components/Link";
import DynamicComponent from "@/components/DynamicComponent";
import { currentUser } from "@/services/auth";

import useReportFlags from "../hooks/useReportFlags";
import "./ReportSourceAlerts.less";

export default function ReportSourceAlerts({ report, dataSourcesAvailable }) {
  const queryFlags = useReportFlags(report); // we don't use flags that depend on data source

  let message = null;
  if (queryFlags.isNew && !queryFlags.canCreate) {
    message = (
      <React.Fragment>
        <Typography.Title level={4}>
          You don't have permission to create new reports on any of the data sources available to you.
        </Typography.Title>
        <p>
          <Typography.Text type="secondary">
            You can either <Link href="reports">browse existing reports</Link>, or ask for additional permissions from
            your Data Reporter admin.
          </Typography.Text>
        </p>
      </React.Fragment>
    );
  } else if (!dataSourcesAvailable) {
    if (currentUser.isAdmin) {
      message = (
        <React.Fragment>
          <Typography.Title level={4}>
            Looks like no data sources were created yet or none of them available to the group(s) you're member of.
          </Typography.Title>
          <p>
            <Typography.Text type="secondary">Please create one first, and then start querying.</Typography.Text>
          </p>

          <div className="report-source-alerts-actions">
            <Link.Button type="primary" href="data_sources/new">
              Create Data Source
            </Link.Button>
            <Link.Button type="default" href="groups">
              Manage Group Permissions
            </Link.Button>
          </div>
        </React.Fragment>
      );
    } else {
      message = (
        <React.Fragment>
          <Typography.Title level={4}>
            Looks like no data sources were created yet or none of them available to the group(s) you're member of.
          </Typography.Title>
          <p>
            <Typography.Text type="secondary">Please ask your Data reporter admin to create one first.</Typography.Text>
          </p>
        </React.Fragment>
      );
    }
  }

  if (!message) {
    return null;
  }

  return (
    <div className="report-source-alerts">
    <Card>
      <DynamicComponent name="ReportSource.Alerts" report={report} dataSourcesAvailable={dataSourcesAvailable}>
        <div className="report-source-alerts-icon">
          <WarningFilledIcon />
        </div>
        {message}
      </DynamicComponent>
    </Card>
    </div>
  );
}

ReportSourceAlerts.propTypes = {
  report: PropTypes.object.isRequired,
  dataSourcesAvailable: PropTypes.bool,
};

ReportSourceAlerts.defaultProps = {
  dataSourcesAvailable: false,
};
