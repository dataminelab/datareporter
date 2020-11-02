import { first } from "lodash";
import React, { useState } from "react";
import Button from "antd/lib/button";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import HelpTrigger from "@/components/HelpTrigger";
import CreateDashboardDialog from "@/components/dashboards/CreateDashboardDialog";
import { Auth, currentUser } from "@/services/auth";
import settingsMenu from "@/services/settingsMenu";
import logoUrl from "@/assets/images/report_icon_small.png";

import VersionInfo from "./VersionInfo";
import "./DesktopNavbar.less";

function NavbarSection({ inlineCollapsed, children, ...props }) {
  return (
    <div
      selectable={false}
      mode={inlineCollapsed ? "inline" : "vertical"}
      inlineCollapsed={inlineCollapsed}
      theme="dark"
      {...props}>
      {children}
    </div>
  );
}

export default function DesktopNavbar() {
  const [collapsed, setCollapsed] = useState(true);

  const firstSettingsTab = first(settingsMenu.getAvailableItems());

  const canCreateQuery = currentUser.hasPermission("create_query");
  const canCreateDashboard = currentUser.hasPermission("create_dashboard");
  const canCreateAlert = currentUser.hasPermission("list_alerts");

  return (
    <div className="desktop-navbar-report">
      <div inlineCollapsed={collapsed} className="desktop-navbar-logo">
        <a href="./">
          <img src={logoUrl} alt="Redash" width="32" height="33" />
        </a>
      </div>

      <div inlineCollapsed={collapsed}>
        {currentUser.hasPermission("list_dashboards") && (
          <div key="dashboards">
            <a href="dashboards">
              <Icon type="desktop" />
              {/*<span>Dashboards</span>*/}
            </a>
          </div>
        )}
        {currentUser.hasPermission("view_query") && (
          <div key="queries">
            <a href="queries">
              <Icon type="code" />
              {/*<span>Queries</span>*/}
            </a>
          </div>
        )}
        {currentUser.hasPermission("view_query") && (
          <div key="reports">
            <a href="reports">
              <Icon type="pie-chart" />
              {/*<span>Reports</span>*/}
            </a>
          </div>
        )}
        {currentUser.hasPermission("list_alerts") && (
          <div key="alerts">
            <a href="alerts">
              <Icon type="alert" />
              {/*<span>Alerts</span>*/}
            </a>
          </div>
        )}
      </div>

      <div inlineCollapsed={collapsed} className="desktop-navbar-spacer">
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && <Menu.Divider />}
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && (
          <div
            key="create"
            popupClassName="desktop-navbar-submenu"
            title={
              <React.Fragment>
                <span data-test="CreateButton">
                  <Icon type="plus" />
                  <span>Create</span>
                </span>
              </React.Fragment>
            }>
            {canCreateQuery && (
              <div key="new-query">
                <a href="queries/new" data-test="CreateQueryMenuItem">
                  New Query
                </a>
              </div>
            )}
            {canCreateQuery && (
              <div key="new-report">
                <a href="reports/new" data-test="CreateReportMenuItem">
                  New Report
                </a>
              </div>
            )}
            {canCreateDashboard && (
              <div key="new-dashboard">
                <a data-test="CreateDashboardMenuItem" onMouseUp={() => CreateDashboardDialog.showModal()}>
                  New Dashboard
                </a>
              </div>
            )}
            {canCreateAlert && (
              <div key="new-alert">
                <a data-test="CreateAlertMenuItem" href="alerts/new">
                  New Alert
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <NavbarSection inlineCollapsed={collapsed}>
        <div key="help">
          <HelpTrigger showTooltip={false} type="HOME">
            <Icon type="question-circle" />
            <span>Help</span>
          </HelpTrigger>
        </div>
        {firstSettingsTab && (
          <div key="settings">
            <a href={firstSettingsTab.path} data-test="SettingsLink">
              <Icon type="setting" />
              <span>Settings</span>
            </a>
          </div>
        )}
      </NavbarSection>

      <NavbarSection inlineCollapsed={collapsed} className="desktop-navbar-profile-menu">
        <div
          key="profile"
          popupClassName="desktop-navbar-submenu"
          title={
            <span data-test="ProfileDropdown" className="desktop-navbar-profile-menu-title">
              <img className="profile__image_thumb" src={currentUser.profile_image_url} alt={currentUser.name} />
              <span>{currentUser.name}</span>
            </span>
          }>
          <div key="profile">
            <a href="users/me">Profile</a>
          </div>
          {currentUser.hasPermission("super_admin") && (
            <div key="status">
              <a href="admin/status">System Status</a>
            </div>
          )}
          <div key="logout">
            <a data-test="LogOutButton" onClick={() => Auth.logout()}>
              Log out
            </a>
          </div>
          <div key="version" disabled className="version-info">
            <VersionInfo />
          </div>
        </div>
      </NavbarSection>

      <Button onClick={() => setCollapsed(!collapsed)} className="desktop-navbar-collapse-button">
        <Icon type={collapsed ? "menu-unfold" : "menu-fold"} />
      </Button>
    </div>
  );
}
