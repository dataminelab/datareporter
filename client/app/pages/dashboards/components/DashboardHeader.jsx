import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";
import { map, includes } from "lodash";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import EllipsisOutlinedIcon from "@ant-design/icons/EllipsisOutlined";
import Modal from "antd/lib/modal";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import Tooltip from "@/components/Tooltip";
import FavoritesControl from "@/components/FavoritesControl";
import EditInPlace from "@/components/EditInPlace";
import PlainButton from "@/components/PlainButton";
import { DashboardTagsControl } from "@/components/tags-control/TagsControl";
import getTags from "@/services/getTags";
import { clientConfig } from "@/services/auth";
import { policy } from "@/services/policy";
import recordEvent from "@/services/recordEvent";
import { durationHumanize } from "@/lib/utils";
import { DashboardStatusEnum } from "../hooks/useDashboard";

import "./DashboardHeader.less";

function getDashboardTags() {
  return getTags("api/dashboards/tags").then(tags => map(tags, t => t.name));
}

function buttonType(value) {
  return value ? "primary" : "default";
}

function DashboardPageTitle({ dashboardConfiguration }) {
  const { dashboard, canEditDashboard, updateDashboard, editingLayout } =
    dashboardConfiguration;
  return (
    <div className="title-with-tags">
      <div className="page-title">
        <FavoritesControl item={dashboard} />
        <h3>
          <EditInPlace
            isEditable={editingLayout}
            onDone={name => updateDashboard({ name })}
            value={dashboard.name}
            ignoreBlanks
          />
        </h3>
        <Tooltip title={dashboard.user.name} placement="bottom">
          <img
            src={dashboard.user.profile_image_url}
            className="profile-image"
            alt={dashboard.user.name}
          />
        </Tooltip>
      </div>
      <DashboardTagsControl
        tags={dashboard.tags}
        isDraft={dashboard.is_draft}
        isArchived={dashboard.is_archived}
        canEdit={canEditDashboard}
        getAvailableTags={getDashboardTags}
        onEdit={tags => updateDashboard({ tags })}
      />
    </div>
  );
}

DashboardPageTitle.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function RefreshButton({ dashboardConfiguration }) {
  const {
    refreshRate,
    setRefreshRate,
    disableRefreshRate,
    refreshing,
    refreshDashboard,
  } = dashboardConfiguration;
  const allowedIntervals = policy.getDashboardRefreshIntervals();
  const refreshRateOptions = clientConfig.dashboardRefreshIntervals;
  const onRefreshRateSelected = ({ key }) => {
    const parsedRefreshRate = parseFloat(key);
    if (parsedRefreshRate) {
      setRefreshRate(parsedRefreshRate);
      refreshDashboard();
    } else {
      disableRefreshRate();
    }
  };
  return (
    <Button.Group>
      <Tooltip
        title={
          refreshRate
            ? `Auto Refreshing every ${durationHumanize(refreshRate)}`
            : null
        }
      >
        <Button
          type={buttonType(refreshRate)}
          onClick={() => refreshDashboard()}
        >
          <i
            className={cx("zmdi zmdi-refresh m-r-5", {
              "zmdi-hc-spin": refreshing,
            })}
            aria-hidden="true"
          />
          {refreshRate ? durationHumanize(refreshRate) : "Refresh"}
        </Button>
      </Tooltip>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        overlay={
          <Menu
            onClick={onRefreshRateSelected}
            selectedKeys={[`${refreshRate}`]}
          >
            {refreshRateOptions.map(option => (
              <Menu.Item
                key={`${option}`}
                disabled={!includes(allowedIntervals, option)}
              >
                {durationHumanize(option)}
              </Menu.Item>
            ))}
            {refreshRate && (
              <Menu.Item key={null}>Disable auto refresh</Menu.Item>
            )}
          </Menu>
        }
      >
        <Button
          className="icon-button hidden-xs"
          type={buttonType(refreshRate)}
        >
          <i className="fa fa-angle-down" aria-hidden="true" />
          <span className="sr-only">Split button!</span>
        </Button>
      </Dropdown>
    </Button.Group>
  );
}

RefreshButton.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function DashboardMoreOptionsButton({ dashboardConfiguration }) {
  const {
    dashboard,
    setEditingLayout,
    togglePublished,
    archiveDashboard,
    managePermissions,
    gridDisabled,
    isDashboardOwnerOrAdmin,
    isDuplicating,
    duplicateDashboard,
  } = dashboardConfiguration;

  const archive = () => {
    Modal.confirm({
      title: "Archive Dashboard",
      content: `Are you sure you want to archive the "${dashboard.name}" dashboard?`,
      okText: "Archive",
      okType: "danger",
      onOk: archiveDashboard,
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      overlay={
        <Menu data-test="DashboardMoreButtonMenu">
          <Menu.Item className={cx({ hidden: gridDisabled })}>
            <PlainButton onClick={() => setEditingLayout(true)}>
              Edit
            </PlainButton>
          </Menu.Item>
          {!isDuplicating && dashboard.canEdit() && (
            <Menu.Item>
              <PlainButton onClick={duplicateDashboard}>
                Fork{" "}
                <i className="fa fa-external-link m-l-5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </PlainButton>
            </Menu.Item>
          )}
          {clientConfig.showPermissionsControl && isDashboardOwnerOrAdmin && (
            <Menu.Item>
              <PlainButton onClick={managePermissions}>
                Manage Permissions
              </PlainButton>
            </Menu.Item>
          )}
          {!clientConfig.disablePublish && !dashboard.is_draft && (
            <Menu.Item>
              <PlainButton onClick={togglePublished}>Unpublish</PlainButton>
            </Menu.Item>
          )}
          <Menu.Item>
            <PlainButton onClick={archive}>Archive</PlainButton>
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        className="icon-button m-l-5"
        data-test="DashboardMoreButton"
        aria-label="More actions"
      >
        <EllipsisOutlinedIcon rotate={90} aria-hidden="true" />
      </Button>
    </Dropdown>
  );
}

DashboardMoreOptionsButton.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function writePrePrompt(question, slug) {
  if (!window.loadedDatasetsByUrl || !window.loadedDatasetsByUrl[slug]) {
    return "No datasets available for this dashboard.";
  }
  const datasets = window.loadedDatasetsByUrl[slug];
  const datasetHeaders = Array.from(
    document.querySelectorAll(".widget-header"),
  ).filter(header => header.innerText && header.innerText.trim() !== "");
  let prompt =
    "You are a data analyst reviewing a dashboard containing several datasets (widgets). Given a user question, analyze the datasets and provide a clear, concise, and human-readable answer based on the available data.\n\n";
  prompt += "Datasets:\n";
  datasets.forEach((d, i) => {
    prompt += `Dataset[${i + 1}]${datasetHeaders[i] ? ` (${datasetHeaders[i].innerText.trim()})` : ""}: ${JSON.stringify(d)}\n`;
  });
  prompt += "\n---\n";
  prompt += `User question: ${question}\n`;
  prompt += "Answer:";
  return prompt;
}

async function getOpenAiAnswer(question, dashboardId) {
  const response = await fetch(`/api/dashboards/${dashboardId}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: question }),
  });
  if (!response.ok) {
    return "Sorry, there was a problem retrieving the answer from the server.";
  }
  const data = await response.json();
  return data.prompt;
}

async function getPromptAnswer(question) {
  try {
    const response = await fetch("ollama-api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:7b",
        prompt: question,
        stream: true,
      }),
    });
    if (!response.ok || !response.body) {
      console.error(response.message);
      return "Sorry, there was a problem connecting to the AI server.";
    }

    const reader = response.body.getReader();
    /* eslint-disable-next-line compat/compat */
    const decoder = new TextDecoder();

    let compiledResponse = "";
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      // Split by newlines and process each complete line as JSON
      let lines = buffer.split("\n");
      buffer = lines.pop(); // Save incomplete line for next chunk
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          let chunkJson = JSON.parse(line);
          compiledResponse += chunkJson.response;
          compiledResponse = compiledResponse.replace("<think>", ``);
          compiledResponse = compiledResponse.replace("</think>", ``);
        } catch (e) {
          // Ignore parse errors for incomplete lines
        }
      }
    }
    // Optionally process any remaining buffer
    if (buffer.trim()) {
      try {
        let chunkJson = JSON.parse(buffer);
        compiledResponse += chunkJson.response;
        compiledResponse = compiledResponse.replace("<think>", ``);
        compiledResponse = compiledResponse.replace("</think>", ``);
      } catch (e) {
        // Ignore parse errors for incomplete buffer
      }
    }
    return compiledResponse;
  } catch (error) {
    console.error(error.message);
    return "Sorry, there was a problem connecting to the AI server.";
  }
}

function DashboardControl({ dashboardConfiguration, headerExtra }) {
  const {
    dashboard,
    togglePublished,
    canEditDashboard,
    fullscreen,
    toggleFullscreen,
    showShareDashboardDialog,
    updateDashboard,
  } = dashboardConfiguration;
  const showPublishButton = dashboard.is_draft;
  const showRefreshButton = true;
  const showFullscreenButton = !dashboard.is_draft;
  const canShareDashboard = canEditDashboard && !dashboard.is_draft;
  const showShareButton =
    !clientConfig.disablePublicUrls &&
    (dashboard.publicAccessEnabled || canShareDashboard);
  const showMoreOptionsButton = canEditDashboard;
  const showPromptButton = true;
  const slug = `${dashboard.id}-${dashboard.name}`;

  const unarchiveDashboard = () => {
    recordEvent("unarchive", "dashboard", dashboard.id);
    updateDashboard({ is_archived: false }, false);
  };
  const [isPromptModalVisible, setPromptModalVisible] = React.useState(false);
  const [promptValue, setPromptValue] = React.useState("");
  const [promptAnswerValue, setPromptAnswerValue] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("deepseek");
  const [sendingPrompt, setSendingPrompt] = React.useState(false);

  const handleSetSelectedModel = value => {
    setSelectedModel(value);
  };

  const handleSetPromptValue = e => {
    setPromptValue(e.target.value);
  };

  const handlePromptSend = async () => {
    if (!promptValue) return;
    setSendingPrompt(true);
    let answer = "";
    const question = writePrePrompt(promptValue, slug);
    if (selectedModel === "chatgpt") {
      // Use OpenAI API for ChatGPT model
      answer = await getOpenAiAnswer(question, dashboard.id);
    } else {
      // Use DeepSeek ollama model for DeepSeek model
      answer = await getPromptAnswer(question);
    }
    setPromptAnswerValue(answer);
    recordEvent("send_prompt", "dashboard", dashboard.id, {
      model: selectedModel,
      answer: promptAnswerValue,
    });
    setSendingPrompt(false);
  };
  const aiOptions = [
    {
      name: "chatgpt",
      value: "chatgpt",
    },
    {
      name: "deepseek",
      value: "deepseek",
    },
  ];
  const formId = `promptForm-${dashboard.id}`;
  return (
    <div className="dashboard-control">
      {dashboard.can_edit && dashboard.is_archived && (
        <Button onClick={unarchiveDashboard}>Unarchive</Button>
      )}
      {!dashboard.is_archived && (
        <span className="hidden-print">
          {showPromptButton && (
            <>
              <Button
                className="m-r-5 hidden-xs"
                onClick={() => setPromptModalVisible(true)}
                loading={sendingPrompt}
                form={formId}
                data-test="DashboardPromptButton"
              >
                <span className="fa fa-comment m-r-5" /> Prompt
              </Button>
              <Modal
                title="Send Prompt"
                visible={isPromptModalVisible}
                onOk={handlePromptSend}
                onCancel={() => setPromptModalVisible(false)}
                okText="Send"
                confirmLoading={sendingPrompt}
              >
                <DynamicForm
                  id={formId}
                  fields={[
                    {
                      required: true,
                      name: "model",
                      title: "Select AI model",
                      type: "select",
                      options: aiOptions,
                      props: {
                        onSelect: handleSetSelectedModel,
                        disabled: sendingPrompt,
                      },
                      initialValue: "deepseek",
                    },
                    {
                      required: true,
                      name: "prompt",
                      title: "Enter your prompt",
                      type: "text",
                      autoFocus: true,
                      props: {
                        onSelect: handleSetPromptValue,
                        disabled: sendingPrompt,
                      },
                    },
                    {
                      required: false,
                      name: "response",
                      title: "Response will appear here...",
                      type: "textarea",
                      loading: !sendingPrompt,
                      value: promptAnswerValue,
                      onChange: () => {},
                      props: { disabled: true },
                    },
                  ]}
                  hideSubmitButton={true}
                />
              </Modal>
            </>
          )}
          {showPublishButton && (
            <Button className="m-r-5 hidden-xs" onClick={togglePublished}>
              <span className="fa fa-paper-plane m-r-5" /> Publish
            </Button>
          )}
          {showRefreshButton && (
            <RefreshButton dashboardConfiguration={dashboardConfiguration} />
          )}
          {showFullscreenButton && (
            <Tooltip
              className="hidden-xs"
              title="Enable/Disable Fullscreen display"
            >
              <Button
                type={buttonType(fullscreen)}
                className="icon-button m-l-5"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen display"
              >
                <i className="zmdi zmdi-fullscreen" aria-hidden="true" />
              </Button>
            </Tooltip>
          )}
          {headerExtra}
          {showShareButton && (
            <Tooltip title="Dashboard Sharing Options">
              <Button
                className="icon-button m-l-5"
                type={buttonType(dashboard.publicAccessEnabled)}
                onClick={showShareDashboardDialog}
                data-test="OpenShareForm"
                aria-label="Share"
              >
                <i className="zmdi zmdi-share" aria-hidden="true" />
              </Button>
            </Tooltip>
          )}
          {showMoreOptionsButton && (
            <DashboardMoreOptionsButton
              dashboardConfiguration={dashboardConfiguration}
            />
          )}
        </span>
      )}
    </div>
  );
}

DashboardControl.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  headerExtra: PropTypes.node,
};

function DashboardEditControl({ dashboardConfiguration, headerExtra }) {
  const {
    setEditingLayout,
    doneBtnClickedWhileSaving,
    dashboardStatus,
    retrySaveDashboardLayout,
  } = dashboardConfiguration;
  let status;
  if (dashboardStatus === DashboardStatusEnum.SAVED) {
    status = <span className="save-status">Saved</span>;
  } else if (dashboardStatus === DashboardStatusEnum.SAVING) {
    status = (
      <span className="save-status" data-saving>
        Saving
      </span>
    );
  } else {
    status = (
      <span className="save-status" data-error>
        Saving Failed
      </span>
    );
  }
  return (
    <div className="dashboard-control">
      {status}
      {dashboardStatus === DashboardStatusEnum.SAVING_FAILED ? (
        <Button type="primary" onClick={retrySaveDashboardLayout}>
          Retry
        </Button>
      ) : (
        <Button
          loading={doneBtnClickedWhileSaving}
          type="primary"
          onClick={() => setEditingLayout(false)}
        >
          {!doneBtnClickedWhileSaving && (
            <i className="fa fa-check m-r-5" aria-hidden="true" />
          )}{" "}
          Done Editing
        </Button>
      )}
      {headerExtra}
    </div>
  );
}

DashboardEditControl.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  headerExtra: PropTypes.node,
};

export default function DashboardHeader({
  dashboardConfiguration,
  headerExtra,
}) {
  const { editingLayout } = dashboardConfiguration;
  const DashboardControlComponent = editingLayout
    ? DashboardEditControl
    : DashboardControl;

  return (
    <div className="dashboard-header">
      <DashboardPageTitle dashboardConfiguration={dashboardConfiguration} />
      <DashboardControlComponent
        dashboardConfiguration={dashboardConfiguration}
        headerExtra={headerExtra}
      />
    </div>
  );
}

DashboardHeader.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  headerExtra: PropTypes.node,
};
