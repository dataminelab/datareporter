import { filter, map, includes, toLower } from "lodash";
import React from "react";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import DownOutlinedIcon from "@ant-design/icons/DownOutlined";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import Paginator from "@/components/Paginator";

import {
  wrap as itemsList,
  ControllerType,
} from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { StateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import ItemsTable, {
  Columns,
} from "@/components/items-list/components/ItemsTable";
import SelectItemsDialog from "@/components/SelectItemsDialog";
import { PermissionPreviewCard } from "@/components/PreviewCard";

import GroupName from "@/components/groups/GroupName";
import ListItemAddon from "@/components/groups/ListItemAddon";
import Sidebar from "@/components/groups/DetailsPageSidebar";
import Layout from "@/components/layouts/ContentWithSidebar";
import wrapSettingsTab from "@/components/SettingsWrapper";

import notification from "@/services/notification";
import { currentUser } from "@/services/auth";
import Group from "@/services/group";
import routes from "@/services/routes";

class GroupPermissions extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  groupId = parseInt(this.props.controller.params.groupId, 10);

  group = null;

  sidebarMenu = [
    {
      key: "users",
      href: `groups/${this.groupId}`,
      title: "Members",
    },
    {
      key: "datasources",
      href: `groups/${this.groupId}/data_sources`,
      title: "Data Sources",
      isAvailable: () => currentUser.isAdmin,
    },
  ];

  constructor(props) {
    super(props);

    if (currentUser.isAdmin) {
      this.sidebarMenu.push({
        key: "permissions",
        href: `groups/${this.groupId}/permissions`,
        title: "Permissions",
        isAvailable: () => currentUser.isAdmin,
      });
    }
  }

  listColumns = [
    Columns.custom(
      (text, permission) => <PermissionPreviewCard permission={permission} />,
      {
        title: "Name",
        field: "name",
        width: null,
      },
    ),
    Columns.custom(
      (text, permission) => (
        <Button
          className="w-100"
          type="danger"
          onClick={() => this.removePermission(permission)}
        >
          Remove
        </Button>
      ),
      {
        width: "1%",
        isAvailable: () => currentUser.isAdmin,
      },
    ),
  ];

  componentDidMount() {
    Group.get({ id: this.groupId })
      .then(group => {
        this.group = group;
        this.forceUpdate();
      })
      .catch(error => {
        this.props.controller.handleError(error);
      });
  }

  removePermission = perm => {
    Group.removePermission({ id: this.groupId }, { permission: perm })
      .then(() => {
        this.props.controller.update();
      })
      .catch(() => {
        notification.error("Failed to remove permission from group.");
      });
  };

  addPermission = () => {
    const allPermissionsPromise = Group.permissions({ id: "all" });
    const alreadyAddedPermissions = this.props.controller.allItems;

    SelectItemsDialog.showModal({
      dialogTitle: "Add Permissions",
      inputPlaceholder: "Search permissions...",
      selectedItemsTitle: "New Permissions",
      searchItems: searchTerm => {
        searchTerm = toLower(searchTerm);
        return allPermissionsPromise.then(items =>
          filter(items, perm => includes(toLower(perm.name), searchTerm)),
        );
      },
      renderItem: (item, { isSelected }) => {
        const alreadyInGroup = includes(alreadyAddedPermissions, item);
        return {
          content: (
            <PermissionPreviewCard permission={item}>
              <ListItemAddon
                isSelected={isSelected}
                alreadyInGroup={alreadyInGroup}
              />
            </PermissionPreviewCard>
          ),
          isDisabled: alreadyInGroup,
          className: isSelected || alreadyInGroup ? "selected" : "",
        };
      },
      renderStagedItem: (item, { isSelected }) => ({
        content: (
          <PermissionPreviewCard permission={item}>
            <ListItemAddon isSelected={isSelected} isStaged />
          </PermissionPreviewCard>
        ),
      }),
    }).onClose(items => {
      const promises = map(items, perm =>
        Group.addPermission({ id: this.groupId }, { permission: perm }),
      );
      return Promise.all(promises)
        .then(() => this.props.controller.update())
        .catch(() => notification.error("Failed to add permission to group."));
    });
  };

  permissions = () => {
    return Group.permissions({ id: this.groupId });
  };

  updatePermission = (permission, data) => {
    Group.updatePermission({ id: this.groupId, permission }, data)
      .then(() => {
        this.props.controller.update();
      })
      .catch(() => {
        notification.error("Failed to update group permission.");
      });
  };

  render() {
    const { controller } = this.props;
    return (
      <div data-test="Group">
        <GroupName
          className="d-block m-t-0 m-b-15"
          group={this.group}
          onChange={() => this.forceUpdate()}
        />
        <Layout>
          <Layout.Sidebar>
            <Sidebar
              controller={controller}
              group={this.group}
              items={this.sidebarMenu}
              canAddPermissions={currentUser.isAdmin}
              onAddPermissionsClick={this.addPermission}
              onGroupDeleted={() => navigateTo("groups")}
            />
          </Layout.Sidebar>
          <Layout.Content>
            {!controller.isLoaded && <LoadingState className="" />}
            {controller.isLoaded && controller.isEmpty && (
              <div className="text-center">
                <p>There are no permissions in this group yet.</p>
                {currentUser.isAdmin && (
                  <Button type="primary" onClick={this.addPermission}>
                    <i className="fa fa-plus m-r-5" aria-hidden="true" />
                    Add Permissions
                  </Button>
                )}
              </div>
            )}
            {controller.isLoaded && !controller.isEmpty && (
              <div className="table-responsive">
                <ItemsTable
                  items={controller.pageItems}
                  columns={this.listColumns}
                  showHeader={false}
                  context={this.actions}
                  orderByField={controller.orderByField}
                  orderByReverse={controller.orderByReverse}
                  toggleSorting={controller.toggleSorting}
                />
                <Paginator
                  showPageSizeSelect
                  totalCount={controller.totalItemsCount}
                  pageSize={controller.itemsPerPage}
                  onPageSizeChange={itemsPerPage =>
                    controller.updatePagination({ itemsPerPage })
                  }
                  page={controller.page}
                  onChange={page => controller.updatePagination({ page })}
                />
              </div>
            )}
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

const GroupPermissionsPage = wrapSettingsTab(
  "Groups.Permissions",
  null,
  itemsList(
    GroupPermissions,
    () =>
      new ResourceItemsSource({
        isPlainList: true,
        getRequest(unused, { params: { groupId } }) {
          return { id: groupId };
        },
        getResource() {
          return Group.permissions.bind(Group);
        },
      }),
    () => new StateStorage({ orderByField: "name" }),
  ),
);

routes.register(
  "Groups.Permissions",
  routeWithUserSession({
    path: "/groups/:groupId/permissions",
    title: "Group Permissions",
    render: pageProps => (
      <GroupPermissionsPage {...pageProps} currentPage="permissions" />
    ),
  }),
);
