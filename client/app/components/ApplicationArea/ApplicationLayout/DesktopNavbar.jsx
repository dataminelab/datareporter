import { first } from "lodash";
import React, { useState } from "react";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import HelpTrigger from "@/components/HelpTrigger";
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
    <Menu
      selectable={false}
      mode={"inline"}
      inlineCollapsed={inlineCollapsed}
      theme="dark"
      {...props}>
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
          <img src={logoUrl} alt="Data reporter" width="25" height="26" />
        </a>
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed} className="left-border">
        {currentUser.hasPermission("list_dashboards") && (
          <Menu.Item key="dashboards">
            <a href="dashboards">
              <span className="icon icon-dashboard"></span>
              {/*<span>Dashboards</span>*/}
            </a>
          </Menu.Item>
        )}
        {currentUser.hasPermission("view_query") && (
          <Menu.Item key="queries">
            <a href="queries">
              <span className="icon icon-command-line"></span>
              {/*<span>Queries</span>*/}
            </a>
          </Menu.Item>
        )}
        {currentUser.hasPermission("view_query") && (
          <Menu.Item key="reports">
            <a href="reports">
              <span className="icon icon-bar-chart"></span>
              {/*<span>Reports</span>*/}
            </a>
          </Menu.Item>
        )}
        {currentUser.hasPermission("list_alerts") && (
          <Menu.Item key="alerts">
            <a href="alerts">
              <span className="icon icon-notifications-allerts-bell"></span>
              {/*<span>Alerts</span>*/}
            </a>
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
                <span data-test="CreateButton">
                  <span className="icon icon-plus"></span>
                  {/*<span>Create</span>*/}
                </span>
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
        <Menu.Item key="messages">
          <a data-test="Messages" href="#">
            <span className="icon icon-chat-rect"></span>
          </a>
        </Menu.Item>
        <Menu.SubMenu
          key="profile-menu"
          popupClassName="desktop-navbar-submenu"
          popupOffset={[-36, 60]}
          title={
            <span data-test="ProfileDropdown" className="desktop-navbar-profile-menu-title">
              <span className="icon icon-more"></span>
            </span>
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
            <span className="icon icon-refresh"></span>
          </a>
        </Menu.Item>
        <Menu.Item key="expand">
          <a data-test="Expand" href="#">
            <span className="icon icon-expand"></span>
          </a>
        </Menu.Item>
        {firstSettingsTab && (
          <Menu.Item key="settings">
            <a href={firstSettingsTab.path} data-test="SettingsLink">
              <span className="icon icon-settings"></span>
            </a>
          </Menu.Item>
        )}
        <Menu.Divider />
      </NavbarSection>
    </div>
  );
}
