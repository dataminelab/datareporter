import React, { useMemo } from "react";
import { first, includes } from "lodash";
import Menu from "antd/lib/menu";
import Tooltip from "@/components/Tooltip";
import Link from "@/components/Link";
import PlainButton from "@/components/PlainButton";
import CreateDashboardDialog from "@/components/dashboards/CreateDashboardDialog";
import { useCurrentRoute } from "@/components/ApplicationArea/Router";
import { Auth, currentUser } from "@/services/auth";
import settingsMenu from "@/services/settingsMenu";
import logoUrl from "@/assets/images/report_icon_small.png";

import VersionInfo from "./VersionInfo";

import "./DesktopNavbar.less";

function NavbarSection({ children, ...props }) {
  return (
    <Menu selectable={false} {...props}>
      {children}
    </Menu>
  );
}

function useNavbarActiveState() {
  const currentRoute = useCurrentRoute();

  return useMemo(
    () => ({
      dashboards: includes(
        [
          "Dashboards.List",
          "Dashboards.Favorites",
          "Dashboards.My",
          "Dashboards.ViewOrEdit",
          "Dashboards.LegacyViewOrEdit",
        ],
        currentRoute.id
      ),
      queries: includes(
        [
          "Queries.List",
          "Queries.Favorites",
          "Queries.Archived",
          "Queries.My",
          "Queries.View",
          "Queries.New",
          "Queries.Edit",
        ],
        currentRoute.id
      ),
      dataSources: includes(["DataSources.List"], currentRoute.id),
      alerts: includes(["Alerts.List", "Alerts.New", "Alerts.View", "Alerts.Edit"], currentRoute.id),
      reports: includes(["Reports.List", "Reports.View", "Reports.Edit", "Reports.New"], currentRoute.id),
    }),
    [currentRoute.id]
  );
}

export default function DesktopNavbar() {
  const activeState = useNavbarActiveState();

  const firstSettingsTab = first(settingsMenu.getAvailableItems());

  const canCreateQuery = currentUser.hasPermission("create_query");
  const canCreateDashboard = currentUser.hasPermission("create_dashboard");
  const canCreateAlert = currentUser.hasPermission("list_alerts");

  const handleDeepRefresh = (event) => {
    event.stopPropagation();
    localStorage.setItem("bypass_cache", true);
    window.location.reload();
  }

  const handleNewReportButton = (event) => {
    event.preventDefault();
    window.location.hash = "#";
    if (window.location.pathname !== "/reports/new") {
      window.location.pathname = "/reports/new";
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="desktop-navbar-report">
      <NavbarSection className="desktop-navbar-logo">
        <div role="menuitem">
          <Link href="./">
            <img className="logo" src={logoUrl} alt="Data reporter" width="25" height="26" />
          </Link>
        </div>
      </NavbarSection>

      <NavbarSection className="left-border">
        {currentUser.hasPermission("list_dashboards") && (
          <Menu.Item key="dashboards" className={activeState.dashboards ? "navbar-active-item" : null}>
            <Tooltip
              placement="bottom"
              title="Dashboards"
            >
              <Link href="dashboards">
                <i className="icon-ui icon-dashboard"></i>
              </Link>
            </Tooltip>
          </Menu.Item>
        )}
        {currentUser.hasPermission("view_query") && (
          <Menu.Item key="queries" className={activeState.queries ? "navbar-active-item" : null}>
            <Tooltip
              placement="bottom"
              title="Queries"
            >
              <Link href="queries">
                  <i className="icon-ui  icon-command-line"></i>
                </Link>
            </Tooltip>
          </Menu.Item>
        )}
        {currentUser.hasPermission("view_query") && (
          <Menu.Item key="reports" className={activeState.reports ? "navbar-active-item" : null}>
            <Tooltip
              placement="bottom"
              title="Reports"
            >
              <Link href="reports">
                  <i className="icon-ui  icon-bar-chart"></i>
                </Link>
              </Tooltip>
          </Menu.Item>
        )}
        {currentUser.hasPermission("list_alerts") && (
          <Menu.Item key="alerts" className={activeState.alerts ? "navbar-active-item" : null}>
            <Tooltip
              placement="bottom"
              title="Alerts"
            >
              <Link href="alerts">
                <i className="icon-ui  icon-notifications-allerts-bell"></i>
              </Link>
            </Tooltip>
          </Menu.Item>
        )}
      </NavbarSection>

      <NavbarSection className="desktop-navbar-spacer">
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && <Menu.Divider />}
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && (
          <Menu.SubMenu
            key="create"
            popupOffset={[-36, 60]}
            title={
              <React.Fragment>
              <Link data-test="CreateButton">
                <i className="icon-ui  icon-plus"></i>
              </Link>
            </React.Fragment>
            }>
            {canCreateQuery && (
              <Menu.Item key="new-query">
                <Link href="queries/new" data-test="CreateQueryMenuItem">
                  New Query
                </Link>
              </Menu.Item>
            )}
            {canCreateQuery && (
              <Menu.Item key="new-report">
                <Link href="reports/new" onClick={handleNewReportButton} data-test="CreateReportMenuItem">
                  New Report
                </Link>
              </Menu.Item>
            )}
            {canCreateDashboard && (
              <Menu.Item key="new-dashboard">
                <PlainButton data-test="CreateDashboardMenuItem" onClick={() => CreateDashboardDialog.showModal()}>
                  New Dashboard
                </PlainButton>
              </Menu.Item>
            )}
            {canCreateAlert && (
              <Menu.Item key="new-alert">
                <Link data-test="CreateAlertMenuItem" href="alerts/new">
                  New Alert
                </Link>
              </Menu.Item>
            )}
          </Menu.SubMenu>
        )}
      </NavbarSection>
      <NavbarSection className="desktop-navbar-profile-menu">
        <Menu.SubMenu
          key="profile"
          popupClassName="desktop-navbar-submenu"
          popupOffset={[-36, 60]}
          tabIndex={0}
          title={
            <span data-test="ProfileDropdown" className="desktop-navbar-profile-menu-title">
              <img className="profile__image_thumb" src={currentUser.profile_image_url} alt={currentUser.name} />
            </span>
          }>
          <Menu.Item key="profile">
            <Link href="users/me">Profile</Link>
          </Menu.Item>
          {currentUser.hasPermission("super_admin") && (
            <Menu.Item key="status">
              <Link href="admin/status">System Status</Link>
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item key="logout">
            <PlainButton data-test="LogOutButton" onClick={() => Auth.logout()}>
              Log out
            </PlainButton>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="version" role="presentation" disabled className="version-info">
            <VersionInfo />
          </Menu.Item>
        </Menu.SubMenu>
      </NavbarSection>

      <NavbarSection className="settings-menu">
        <Menu.Item key="refresh">
          <a data-test="Refresh" href="#" onClick={handleDeepRefresh}>
            <i className="icon-ui icon-refresh"></i>
          </a>
        </Menu.Item>
        {firstSettingsTab && (
          <Menu.Item key="settings">
            <a href={firstSettingsTab.path} data-test="SettingsLink">
              <i className="icon-ui  icon-settings"></i>
            </a>
          </Menu.Item>
        )}
        <Menu.Divider />
      </NavbarSection>
    </div>
  );
}
