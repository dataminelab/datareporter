import React, { useEffect, useRef } from "react";
import cx from "classnames";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import Link from "@/components/Link";
import PageHeader from "@/components/PageHeader";
import Paginator from "@/components/Paginator";
import DynamicComponent from "@/components/DynamicComponent";
import { QueryTagsControl } from "@/components/tags-control/TagsControl";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import useItemsListExtraActions from "@/components/items-list/hooks/useItemsListExtraActions";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

import * as Sidebar from "@/components/items-list/components/Sidebar";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import Layout from "@/components/layouts/ContentWithSidebar";

import { Report } from "@/services/report";
import { currentUser } from "@/services/auth";
import location from "@/services/location";
import routes from "@/services/routes";

import ReportsListEmptyState from "./ReportsListEmptyState";

import "./reports-list.css";

const sidebarMenu = [
  {
    key: "all",
    href: "reports",
    title: "All Reports",
    icon: () => <Sidebar.MenuIcon icon="fa fa-code" />,
  },
  {
    key: "my",
    href: "reports/my",
    title: "My Reports",
    icon: () => <Sidebar.ProfileImage user={currentUser} />,
  },
  {
    key: "favorites",
    href: "reports/favorites",
    title: "Favorites",
    icon: () => <Sidebar.MenuIcon icon="fa fa-star" />,
  },
  {
    key: "archive",
    href: "reports/archive",
    title: "Archived",
    icon: () => <Sidebar.MenuIcon icon="fa fa-archive" />,
  },
];

const listColumns = [
  Columns.favorites({ className: "p-r-0" }),
  Columns.custom.sortable(
    (text, item) => (
      <React.Fragment>
        <Link className="table-main-title" href={"reports/" + item.id + '/source#' + item.report}>
          {item.name}
        </Link>
        <QueryTagsControl className="d-block" tags={item.tags} isDraft={item.is_draft} isArchived={item.is_archived} />
      </React.Fragment>
    ),
    {
      title: "Name",
      field: "name",
      width: null,
    }
  ),
  Columns.custom((text, item) => item.user.name, { title: "Created By", width: "1%" }),
  Columns.dateTime.sortable({ title: "Created At", field: "created_at", width: "1%" }),
  // below 2 is not implemented yet...
  // Columns.dateTime.sortable({
  //   title: "Last Executed At",
  //   field: "retrieved_at",
  //   orderByField: "executed_at",
  //   width: "1%",
  // }),
  // Columns.custom.sortable((text, item) => <SchedulePhrase schedule={item.schedule} isNew={item.isNew()} />, {
  //   title: "Refresh Schedule",
  //   field: "schedule",
  //   width: "1%",
  // }),
];

function ReportsListExtraActions(props) {
  return <DynamicComponent name="ReportsList.Actions" {...props} />;
}

function ReportsList({ controller }) {
  const controllerRef = useRef();
  controllerRef.current = controller;

  useEffect(() => {
    const unlistenLocationChanges = location.listen((unused, action) => {
      const searchTerm = location.search.q || "";
      if (action === "PUSH" && searchTerm !== controllerRef.current.searchTerm) {
        controllerRef.current.updateSearch(searchTerm);
      }
    });

    return () => {
      unlistenLocationChanges();
    };
  }, []);

  const {
    areExtraActionsAvailable,
    listColumns: tableColumns,
    Component: ExtraActionsComponent,
    selectedItems,
  } = useItemsListExtraActions(controller, listColumns, ReportsListExtraActions);

  return (
    <div className="page-reports-list">
      <div className="container">
        <PageHeader
          title={controller.params.pageTitle}
          actions={
            currentUser.hasPermission("create_query") ? (
              <Link.Button block type="primary" href="reports/new">
                <i className="fa fa-plus m-r-5" aria-hidden="true" />
                New Report
              </Link.Button>
            ) : null
          }
        />
        <Layout>
          <Layout.Sidebar className="m-b-0">
            <Sidebar.SearchInput
              placeholder="Search Report..."
              label="Search reports"
              value={controller.searchTerm}
              onChange={controller.updateSearch}
            />
            <Sidebar.Menu items={sidebarMenu} selected={controller.params.currentPage} />
            <Sidebar.Tags url="api/queries/tags" onChange={controller.updateSelectedTags} showUnselectAll />
          </Layout.Sidebar>
          <Layout.Content>
            {controller.isLoaded && controller.isEmpty ? (
              <ReportsListEmptyState
                page={controller.params.currentPage}
                searchTerm={controller.searchTerm}
                selectedTags={controller.selectedTags}
              />
            ) : (
              <React.Fragment>
                <div className={cx({ "m-b-10": areExtraActionsAvailable })}>
                  <ExtraActionsComponent selectedItems={selectedItems} />
                </div>
                <div className="bg-white tiled table-responsive">
                  <ItemsTable
                    items={controller.pageItems}
                    loading={!controller.isLoaded}
                    columns={tableColumns}
                    orderByField={controller.orderByField}
                    orderByReverse={controller.orderByReverse}
                    toggleSorting={controller.toggleSorting}
                  />
                  <Paginator
                    showPageSizeSelect
                    totalCount={controller.totalItemsCount}
                    pageSize={controller.itemsPerPage}
                    onPageSizeChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
                    page={controller.page}
                    onChange={page => controller.updatePagination({ page })}
                  />
                </div>
              </React.Fragment>
            )}
          </Layout.Content>
        </Layout>
      </div>
    </div>
  );
}

ReportsList.propTypes = {
  controller: ControllerType.isRequired,
};

const ReportsListPage = itemsList(
  ReportsList,
  () =>
    new ResourceItemsSource({
      getResource({ params: { currentPage } }) {
        return {
          all: Report.report.bind(Report),
          my: Report.myReports.bind(Report),
          favorites: Report.favorites.bind(Report),
          archive: Report.archive.bind(Report),
        }[currentPage];
      },
      getItemProcessor() {
        return item => new Report(item);
      },
    }),
  () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
);

routes.register(
  "Reports.List",
  routeWithUserSession({
    path: "/reports",
    title: "Reports",
    render: pageProps => <ReportsListPage {...pageProps} currentPage="all" />,
  })
);
routes.register(
  "Reports.Favorites",
  routeWithUserSession({
    path: "/reports/favorites",
    title: "Favorite Reports",
    render: pageProps => <ReportsListPage {...pageProps} currentPage="favorites" />,
  })
);
routes.register(
  "Reports.Archived",
  routeWithUserSession({
    path: "/reports/archive",
    title: "Archived Reports",
    render: pageProps => <ReportsListPage {...pageProps} currentPage="archive" />,
  })
);
routes.register(
  "Reports.My",
  routeWithUserSession({
    path: "/reports/my",
    title: "My Reports",
    render: pageProps => <ReportsListPage {...pageProps} currentPage="my" />,
  })
);
