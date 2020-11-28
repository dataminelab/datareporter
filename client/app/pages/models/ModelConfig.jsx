import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import EmailSettingsWarning from "@/components/EmailSettingsWarning";
import DynamicComponent from "@/components/DynamicComponent";
import LoadingState from "@/components/items-list/components/LoadingState";
import wrapSettingsTab from "@/components/SettingsWrapper";

import Model from "@/services/model";
import routes from "@/services/routes";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

import EditableModelConfig from "./components/EditableModelConfig";

import "./settings.less";
import navigateTo from "@/components/ApplicationArea/navigateTo";

function ModelConfig({ modelId, onError }) {
  const [model, setModel] = useState(null);

  const handleError = useImmutableCallback(onError);

  useEffect(() => {
    let isCancelled = false;
    Model.get(modelId)
      .then(res => {
        setModel(res);
      })
      .catch(error => {
        if (!isCancelled) {
          handleError(error);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [modelId, handleError]);

  const saveConfig = (id, content) => {
    Model.saveConfig(id, content)
      .then(() => {
        navigateTo("models");
      })
      .catch(error => {
        handleError(error);
      });
  }

  return (
    <React.Fragment>
      <EmailSettingsWarning featureName="invite emails" className="m-b-20" adminOnly />
      <div className="row">
        {!model && <LoadingState className="" />}
        {model && (
          <DynamicComponent name="ModelConfig" model={model}>
            <EditableModelConfig model={model} saveConfig={saveConfig} />
          </DynamicComponent>
        )}
      </div>
    </React.Fragment>
  );
}

ModelConfig.propTypes = {
  modelId: PropTypes.string,
  onError: PropTypes.func,
};

ModelConfig.defaultProps = {
  modelId: null,
  onError: () => {},
};

const ModelConfigPage = wrapSettingsTab(
  "Users.Config",
  {
    title: "Model config",
    path: "models/config",
    order: 7,
    isHide: true
  },
  ModelConfig
);

routes.register(
  "Models.Config",
  routeWithUserSession({
    path: "/models/:modelId",
    title: "Model config",
    render: pageProps => <ModelConfigPage {...pageProps} />,
  })
);
