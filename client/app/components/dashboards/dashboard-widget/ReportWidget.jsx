import React from "react";
import PropTypes from "prop-types";
import Widget from "./Widget";
import ReportView from "@/components/ReportView";

function ReportWidget(props) {
  const { widget, canEdit } = props;

  const turniloHash = '#' + widget.text.replace('[turnilo-widget]', '')
  const TurniloMenuOptions = [];

  if (!widget.width) {
    return null;
  }

  return (
    <Widget {...props} menuOptions={canEdit ? TurniloMenuOptions : null} className="widget-text">
      <ReportView
        hash={turniloHash}
      />
    </Widget>
  );

}

ReportWidget.propTypes = {
  widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool
};

ReportWidget.defaultProps = {
  canEdit: false,
};

export default ReportWidget;
