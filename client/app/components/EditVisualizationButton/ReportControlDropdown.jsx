import React from "react";
import PropTypes from "prop-types";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Button from "antd/lib/button";
import Icon from "antd/lib/icon";

import ReportResultsLink from "./ReportResultsLink";

export function ReportMenuElement(props) {
  return (
    <Menu>
      {!props.report.isNew() && (!props.report.is_draft || !props.report.is_archived) && (
        <Menu.Item>
          <a target="_self" onClick={() => props.openAddToDashboardForm(props.selectedTab)}>
            <Icon type="plus-circle" theme="filled" /> Add to Dashboard
          </a>
        </Menu.Item>
      )}
      {!props.report.isNew() && (
        <Menu.Item>
          <a onClick={() => props.showEmbedDialog(props.report, props.selectedTab)} data-test="ShowEmbedDialogButton">
            <Icon type="share-alt" /> Embed Elsewhere
          </a>
        </Menu.Item>
      )}
      <Menu.Item>
        <ReportResultsLink
          fileType="csv"
          disabled={props.queryExecuting || !props.queryResult.getData || !props.queryResult.getData()}
          report={props.report}
          queryResult={props.queryResult}
          embed={props.embed}
          apiKey={props.apiKey}>
          <Icon type="file" /> Download as CSV File
        </ReportResultsLink>
      </Menu.Item>
      <Menu.Item>
        <ReportResultsLink
          fileType="tsv"
          disabled={props.queryExecuting || !props.queryResult.getData || !props.queryResult.getData()}
          report={props.report}
          queryResult={props.queryResult}
          embed={props.embed}
          apiKey={props.apiKey}>
          <Icon type="file" /> Download as TSV File
        </ReportResultsLink>
      </Menu.Item>
      <Menu.Item>
        <ReportResultsLink
          fileType="xlsx"
          disabled={props.queryExecuting || !props.queryResult.getData || !props.queryResult.getData()}
          report={props.report}
          queryResult={props.queryResult}
          embed={props.embed}
          apiKey={props.apiKey}>
          <Icon type="file-excel" /> Download as Excel File
        </ReportResultsLink>
      </Menu.Item>
    </Menu>
  );
}
export default function ReportControlDropdown(props) {
  const menu = ReportMenuElement(props);
  return (
    <Dropdown trigger={["click"]} overlay={menu} overlayClassName="report-control-dropdown-overlay">
      <Button data-test="ReportControlDropdownButton">
        <Icon type="ellipsis" rotate={90} />
      </Button>
    </Dropdown>
  );
}

ReportControlDropdown.propTypes = {
  report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  queryResult: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  queryExecuting: PropTypes.bool.isRequired,
  showEmbedDialog: PropTypes.func.isRequired,
  embed: PropTypes.bool,
  apiKey: PropTypes.string,
  selectedTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  openAddToDashboardForm: PropTypes.func.isRequired,
};

ReportControlDropdown.defaultProps = {
  queryResult: {},
  embed: false,
  apiKey: "",
  selectedTab: "",
};
