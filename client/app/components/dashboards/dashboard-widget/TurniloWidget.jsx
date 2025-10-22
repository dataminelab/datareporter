import * as React from "react";
import * as PropTypes from "prop-types";
import { TurniloApplication } from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application-widget";
import Widget from "./Widget";
import { init as errorReporterInit } from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import { Timekeeper } from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";

function TurniloWidget({ widget, canEdit = false, config, setFilterParams, getEssence }) {
  const turniloHash = config?.hash || widget.text?.replace("[turnilo-widget]", "") || "";

  if (!widget?.width || !config?.appSettings) {
    return canEdit ? (
      <Widget menuOptions={null} className="widget-text">
        <h4>Loading...</h4>
      </Widget>
    ) : null;
  }

  // Initialize error reporter if configured
  if (config.appSettings.customization?.sentryDSN) {
    errorReporterInit(config.appSettings.customization.sentryDSN, config.version);
  }

  return (
    <Widget
      menuOptions={canEdit ? [] : null}
      className="widget-report"
      widget={widget}
      canEdit={canEdit}
      config={config}
    >
      <turnilo-widget>
        <TurniloApplication
          widget={widget}
          config={config}
          version={config.version}
          hashWidget={turniloHash}
          appSettings={config.appSettings}
          initTimekeeper={Timekeeper.fromJS(config.timekeeper || { timeTags: {} })}
          setFilterParams={setFilterParams}
          getEssence={getEssence}
        />
      </turnilo-widget>
    </Widget>
  );
}

TurniloWidget.propTypes = {
  widget: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  config: PropTypes.object,
  setFilterParams: PropTypes.func,
  getEssence: PropTypes.func,
};

TurniloWidget.defaultProps = {
  canEdit: false,
};

export default TurniloWidget;
