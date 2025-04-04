import React from "react";
import PropTypes from "prop-types";
import Popover from "antd/lib/popover";
import QuestionCircleFilledIcon from "@ant-design/icons/QuestionCircleFilled";
import { visualizationsSettings } from "@/visualizations/visualizationsSettings";

import "./context-help.less";

export default function ContextHelp({ icon, children, ...props }) {
  return (
    <Popover {...props} content={children}>
      {icon || ContextHelp.defaultIcon}
    </Popover>
  );
}

ContextHelp.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
};

ContextHelp.defaultProps = {
  icon: null,
  children: null,
};

ContextHelp.defaultIcon = <QuestionCircleFilledIcon className="context-help-default-icon" />;

function NumberFormatSpecs() {
  const { HelpTriggerComponent } = visualizationsSettings;
  return (
    <HelpTriggerComponent
      type="NUMBER_FORMAT_SPECS"
      title="Formatting Numbers"
      href="https://redash.io/help/user-guide/visualizations/formatting-numbers"
      className="visualization-editor-context-help">
      {ContextHelp.defaultIcon}
    </HelpTriggerComponent>
  );
}

function DateTimeFormatSpecs() {
  const { HelpTriggerComponent } = visualizationsSettings;
  return (
    <HelpTriggerComponent
      title="Formatting Dates and Times"
      href="https://momentjs.com/docs/#/displaying/format/"
      className="visualization-editor-context-help">
      {ContextHelp.defaultIcon}
    </HelpTriggerComponent>
  );
}

function TickFormatSpecs() {
  const { HelpTriggerComponent } = visualizationsSettings;
  return (
    <HelpTriggerComponent
      title="Tick Formatting"
      href="https://redash.io/help/user-guide/visualizations/formatting-axis"
      className="visualization-editor-context-help">
      {ContextHelp.defaultIcon}
    </HelpTriggerComponent>
  );
}

ContextHelp.NumberFormatSpecs = NumberFormatSpecs;
ContextHelp.DateTimeFormatSpecs = DateTimeFormatSpecs;
ContextHelp.TickFormatSpecs = TickFormatSpecs;
