import { first } from "lodash";
import React, { useState } from "react";
import Menu from "antd/lib/menu";
import Tooltip from "antd/lib/tooltip";
import CreateDashboardDialog from "@/components/dashboards/CreateDashboardDialog";
import { Auth, currentUser } from "@/services/auth";
import settingsMenu from "@/services/settingsMenu";
import routes from "@/services/routes";
import location from "@/services/location";
import logoUrl from "@/assets/images/report_icon_small.png";

import VersionInfo from "./VersionInfo";
import "./DesktopNavbar.less";

function NavbarSection({ inlineCollapsed, children, ...props }) {
  return (
    <Menu selectable={false} {...props}>
      {children}
    </Menu>
  );
}

export default function DesktopNavbar() {
  const [collapsed, setCollapsed] = useState(true);

  const firstSettingsTab = first(settingsMenu.getAvailableItems());
  const headerBlock = routes.getRoute(location.path) ? routes.getRoute(location.path).headerBlock : {};

  const canCreateQuery = currentUser.hasPermission("create_query");
  const canCreateDashboard = currentUser.hasPermission("create_dashboard");
  const canCreateAlert = currentUser.hasPermission("list_alerts");


  return (
    <div className="desktop-navbar-report">
      <NavbarSection inlineCollapsed={collapsed} className="desktop-navbar-logo">
        <a href="./">
          <img class="logo" src={logoUrl} alt="Datareporter" width="25" height="26" />
        </a>
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed} className="left-border">
        {currentUser.hasPermission("list_dashboards") && (
          <Menu.Item key="dashboards">
            <Tooltip
              placement="bottom"
              title="Dashboards"
            >
             <a href="dashboards">
              <i className="icon-ui icon-dashboard"></i>
            </a>
            </Tooltip>
          </Menu.Item>
        )}
        {currentUser.hasPermission("view_query") && (
          <Menu.Item key="queries">
            <Tooltip
              placement="bottom"
              title="Queries"
            >
              <a href="queries">
                  <i className="icon-ui  icon-command-line"></i>
              </a>
            </Tooltip>
          </Menu.Item>
        )}
        {currentUser.hasPermission("view_query") && (
          <Menu.Item key="reports">
            <Tooltip
              placement="bottom"
              title="Reports"
            >
              <a href="reports">
                <i className="icon-ui  icon-bar-chart"></i>
              </a>
            </Tooltip>
          </Menu.Item>
        )}
        {currentUser.hasPermission("list_alerts") && (
          <Menu.Item key="alerts">
            <Tooltip
              placement="bottom"
              title="Alerts"
            >
              <a href="alerts">
                <i className="icon-ui  icon-notifications-allerts-bell"></i>
              </a>
            </Tooltip>
          </Menu.Item>
        )}
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed} className="desktop-navbar-spacer">
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && <Menu.Divider />}
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && (
          <Menu.SubMenu
            key="create"
            popupOffset={[-36, 60]}
            title={
              <React.Fragment>
                <Tooltip
                  placement="bottom"
                  title="Create"
                >
                  <a data-test="CreateButton">
                    <i className="icon-ui  icon-plus"></i>
                  </a>
                </Tooltip>
              </React.Fragment>
            }>
            {canCreateQuery && (
              <Menu.Item key="new-query">
                <a href="queries/new" data-test="CreateQueryMenuItem">
                  New Query
                </a>
              </Menu.Item>
            )}
            {canCreateQuery && (
              <Menu.Item key="new-report">
                <a href="reports/new" data-test="CreateReportMenuItem">
                  New Report
                </a>
              </Menu.Item>
            )}
            {canCreateDashboard && (
              <Menu.Item key="new-dashboard">
                <a data-test="CreateDashboardMenuItem" onMouseUp={() => CreateDashboardDialog.showModal()}>
                  New Dashboard
                </a>
              </Menu.Item>
            )}
            {canCreateAlert && (
              <Menu.Item key="new-alert">
                <a data-test="CreateAlertMenuItem" href="alerts/new">
                  New Alert
                </a>
              </Menu.Item>
            )}
          </Menu.SubMenu>
        )}
      </NavbarSection>
      <NavbarSection inlineCollapsed={collapsed} className="desktop-navbar-profile-menu">
       {/* <Menu.Item key="messages">
          <a data-test="Messages" href="#">
            <i className="icon-ui  icon-chat-rect"></i>
          </a>
        </Menu.Item>*/}
        <Menu.SubMenu
          key="profile-menu"
          popupClassName="desktop-navbar-submenu"
          popupOffset={[-36, 60]}
          title={
            <Tooltip
              placement="bottom"
              title="Settings"
            >
              <div data-test="ProfileDropdown" className="desktop-navbar-profile-menu-title">
                <i className="icon-ui icon-more"></i>
              </div>
            </Tooltip>
          }>
          <Menu.Item key="profile">
            <a href="users/me">Profile</a>
          </Menu.Item>
          {currentUser.hasPermission("super_admin") && (
            <Menu.Item key="status">
              <a href="admin/status">System Status</a>
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item key="logout">
            <a data-test="LogOutButton" onClick={() => Auth.logout()}>
              Log out
            </a>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="version" disabled className="version-info">
            <VersionInfo />
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.Item key="account">
          <a data-test="AccountButton" href="users/me">
            <img className="profile__image_thumb" src={currentUser.profile_image_url} alt={currentUser.name} />
          </a>
        </Menu.Item>
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed} className="settings-menu">
        <Menu.Item key="refresh">
          <a data-test="Refresh" href="#">
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
