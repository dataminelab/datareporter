import { keys, some } from "lodash";
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CreateDashboardDialog from "@/components/dashboards/CreateDashboardDialog";
import { currentUser } from "@/services/auth";
import organizationStatus from "@/services/organizationStatus";
import "./empty-state.less";

function Step({ show, completed, text, url, urlText, onClick }) {
  if (!show) {
    return null;
  }

  if (completed) {
    return (
      <li className="done">
        <i className="fa fa-check-circle" /> {urlText} {text}
      </li>
    );
  }

  return (
    <li>
      <a href={url} onClick={onClick}>
        {urlText} {text}
      </a>
    </li>
  );
}

Step.propTypes = {
  show: PropTypes.bool.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  url: PropTypes.string,
  urlText: PropTypes.string,
  onClick: PropTypes.func,
};

Step.defaultProps = {
  url: null,
  urlText: null,
  onClick: null,
};

function EmptyState({
  icon,
  header,
  description,
  illustration,
  illustrationType=".svg",
  illustrationWidth="75%",
  helpLink,
  onboardingMode,
  showAlertStep,
  showDashboardStep,
  showInviteStep,
}) {
  const isAvailable = {
    dataSource: true,
    model: true,
    // query: true,
    reports: true,
    alert: showAlertStep,
    dashboard: showDashboardStep,
    inviteUsers: showInviteStep,
  };

  const isCompleted = {
    dataSource: organizationStatus.objectCounters.data_sources > 0,
    model: organizationStatus.objectCounters.models > 0,
    // query: organizationStatus.objectCounters.queries > 0,
    reports: organizationStatus.objectCounters.reports > 0,
    alert: organizationStatus.objectCounters.alerts > 0,
    dashboard: organizationStatus.objectCounters.dashboards > 0,
    inviteUsers: organizationStatus.objectCounters.users > 1,
  };

  const showCreateDashboardDialog = useCallback(() => {
    CreateDashboardDialog.showModal();
  }, []);

  // Show if `onboardingMode=false` or any requested step not completed
  const shouldShow = !onboardingMode || some(keys(isAvailable), step => isAvailable[step] && !isCompleted[step]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="empty-state bg-white tiled">
      <div className="empty-state__summary">
        {header && <h4>{header}</h4>}
        <h2>
          <i className={icon} />
        </h2>
        <p>{description}</p>
        <img
          src={"/static/images/illustrations/" + illustration + illustrationType}
          alt={illustration + " Illustration"}
          style={{
            width: illustrationWidth
          }}
        />
      </div>
      <div className="empty-state__steps">
        <h4>Let&apos;s get started</h4>
        <ol>
          {currentUser.isAdmin && (
            <Step
              show={isAvailable.dataSource}
              completed={isCompleted.dataSource}
              url="data_sources/new"
              urlText="Connect"
              text="a Data Source"
            />
          )}
          {!currentUser.isAdmin && (
            <Step
              show={isAvailable.dataSource}
              completed={isCompleted.dataSource}
              text="Ask an account admin to connect a Data Source"
            />
          )}
          {currentUser.isAdmin && (
            <Step
              show={isAvailable.model}
              completed={isCompleted.model}
              url="models"
              urlText="Create"
              text="your first Model"
            />
          )}
          {!currentUser.isAdmin && (
            <Step
              show={isAvailable.model}
              completed={isCompleted.model}
              text="Ask an account admin to create a Model"
            />
          )}
          <Step
            show={isAvailable.reports}
            completed={isCompleted.reports}
            url="reports/new"
            urlText="Create"
            text="your first Report"
          />
          <Step
            show={isAvailable.alert}
            completed={isCompleted.alert}
            url="alerts/new"
            urlText="Create"
            text="your first Alert"
          />
          <Step
            show={isAvailable.dashboard}
            completed={isCompleted.dashboard}
            onClick={showCreateDashboardDialog}
            urlText="Create"
            text="your first Dashboard"
          />
          <Step
            show={isAvailable.inviteUsers}
            completed={isCompleted.inviteUsers}
            url="users/new"
            urlText="Invite"
            text="your team members"
          />
        </ol>
        <p>
          Need more support?{" "}
          <a href={helpLink} target="_blank" rel="noopener noreferrer">
            See our Help
            <i className="fa fa-external-link m-l-5" aria-hidden="true" />
          </a>
        </p>
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  header: PropTypes.string,
  description: PropTypes.string.isRequired,
  illustration: PropTypes.string.isRequired,
  helpLink: PropTypes.string.isRequired,

  onboardingMode: PropTypes.bool,
  showAlertStep: PropTypes.bool,
  showDashboardStep: PropTypes.bool,
  showInviteStep: PropTypes.bool,
};

EmptyState.defaultProps = {
  icon: null,
  header: null,

  onboardingMode: false,
  showAlertStep: false,
  showDashboardStep: false,
  showInviteStep: false,
};

export default EmptyState;
