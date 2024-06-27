import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { isEmpty } from "lodash";
import Dropdown from "antd/lib/dropdown";
import Modal from "antd/lib/modal";
import Menu from "antd/lib/menu";
import recordEvent from "@/services/recordEvent";
import { Moment } from "@/components/proptypes";
import { Report } from "@/services/report";
import "./Widget.less";

function downloadCSV(data) {
  const headers = Object.keys(data[0]);
  const csvContent = "data:text/csv;charset=utf-8," +
    headers.join(",") + "\n" +
    data.map(row => headers.map(header => row[header]).join(",")).join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  // TODO: use report name
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
}

function getExtraOptions(report) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await Report.getData(report);
        setData(result);
      } catch (error) {
        console.error('Error while fetching', error);
      }
    };

    fetchData(); // Call the async function
  }, [report]);

  const extraOptions = [];
  if (data) {
    extraOptions.push(
      <Menu.Item key="download_report" onClick={() => downloadCSV(data)}>Download as CSV File</Menu.Item>
    );
    extraOptions.push(<Menu.Divider key="divider_report" />);
  }
  extraOptions.push(
    <Menu.Item key="view_report" onClick={() => window.location.href=`/reports/${report.id}/source`}>View Report</Menu.Item>
  );
  return extraOptions;
}

function WidgetDropdownButton({ report, extraOptions, showDeleteOption, onDelete }) {
  if (report?.hash) {
    extraOptions = getExtraOptions(report);
  }
  const WidgetMenu = (
    <Menu data-test="WidgetDropdownButtonMenu">
      {extraOptions}
      {showDeleteOption && <Menu.Divider />}
      {showDeleteOption && <Menu.Item onClick={onDelete}>Remove from Dashboard</Menu.Item>}
    </Menu>
  );

  return (
    <div className="widget-menu-regular">
      <Dropdown overlay={WidgetMenu} placement="bottomRight" trigger={["click"]}>
        <a className="action p-l-15 p-r-15" data-test="WidgetDropdownButton">
          <i className="zmdi zmdi-more-vert" />
        </a>
      </Dropdown>
    </div>
  );
}

WidgetDropdownButton.propTypes = {
  extraOptions: PropTypes.node,
  showDeleteOption: PropTypes.bool,
  onDelete: PropTypes.func,
};

WidgetDropdownButton.defaultProps = {
  extraOptions: null,
  showDeleteOption: false,
  onDelete: () => {},
};

function WidgetDeleteButton({ onClick }) {
  return (
    <div className="widget-menu-remove">
      <a className="action" title="Remove From Dashboard" onClick={onClick} data-test="WidgetDeleteButton">
        <i className="zmdi zmdi-close" />
      </a>
    </div>
  );
}

WidgetDeleteButton.propTypes = { onClick: PropTypes.func };
WidgetDeleteButton.defaultProps = { onClick: () => {} };

class Widget extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.node,
    footer: PropTypes.node,
    canEdit: PropTypes.bool,
    isPublic: PropTypes.bool,
    refreshStartedAt: Moment,
    menuOptions: PropTypes.node,
    tileProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    className: "",
    children: null,
    header: null,
    footer: null,
    canEdit: false,
    isPublic: false,
    refreshStartedAt: null,
    menuOptions: null,
    tileProps: {},
    onDelete: () => {},
  };

  componentDidMount() {
    const { widget } = this.props;
    recordEvent("view", "widget", widget.id);
  }

  deleteWidget = () => {
    const { widget, onDelete } = this.props;

    Modal.confirm({
      title: "Delete Widget",
      content: "Are you sure you want to remove this widget from the dashboard?",
      okText: "Delete",
      okType: "danger",
      onOk: () => widget.delete().then(onDelete),
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  render() {
    const { className, children, header, footer, canEdit, isPublic, menuOptions, tileProps, config } = this.props;
    const showDropdownButton = !isPublic && (canEdit || !isEmpty(menuOptions));
    return (
      <div className="widget-wrapper">
        <div className={cx("tile body-container", className)} {...tileProps}>
          <div className="widget-actions">
            {showDropdownButton && (
              <WidgetDropdownButton
                report={config}
                extraOptions={menuOptions}
                showDeleteOption={canEdit}
                onDelete={this.deleteWidget}
              />
            )}
            {canEdit && <WidgetDeleteButton onClick={this.deleteWidget} />}
          </div>
          <div className="body-row widget-header">{config?.name || header}</div>
          {children}
          {footer && <div className="body-row tile__bottom-control">{footer}</div>}
        </div>
      </div>
    );
  }
}

export default Widget;
