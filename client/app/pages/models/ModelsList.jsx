import { isString, map, get, find } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import Paginator from "@/components/Paginator";
import InputWithCopy from "@/components/InputWithCopy";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import EmptyState from "@/components/items-list/components/EmptyState";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import wrapSettingsTab from "@/components/SettingsWrapper";

import { currentUser } from "@/services/auth";
import { policy } from "@/services/policy";
import Model from "@/services/model";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import notification from "@/services/notification";
import { absoluteUrl } from "@/services/utils";
import routes from "@/services/routes";

import CreateModelDialog from "./components/CreateModelDialog";
import DataSource from "@/services/data-source";

function ModelsListActions({ model, editModel, deleteModel }) {
  return <>
            <Button type="primary" className="w-100 m-2" onClick={event => editModel(event, model)}>
              Edit
            </Button> <br/>
            <Button type="danger" className="w-100 m-2" onClick={event => deleteModel(event, model)}>
              Delete
            </Button>
          </>;
}

ModelsListActions.propTypes = {
  model: PropTypes.shape({
    id: PropTypes.number,
    is_invitation_pending: PropTypes.bool,
    is_disabled: PropTypes.bool,
  }).isRequired,
  enableModel: PropTypes.func.isRequired,
  disableModel: PropTypes.func.isRequired,
  deleteModel: PropTypes.func.isRequired,
};

class ModelsList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  state = {
    dataSources: [],
    loading: true,
  };

  getDataSourceName(model) {
    const connection = this.state.dataSources.find(x => x.id === parseInt(model.connection, 10));
    if (connection) {
      return connection.name;
    } else {
       return model.connection;
    }
  }

  listColumns = [
    Columns.custom.sortable((text, model) => model.name, {
      title: "Name",
      field: "name",
      width: null,
    }),
    Columns.custom.sortable(
      (text, model) => this.getDataSourceName(model),
      {
        title: "Connection",
        field: "connection",
      }
    ),
    Columns.custom(
      (text, model) => (
        <ModelsListActions
          model={model}
          enableModel={this.enableModel}
          disableModel={this.disableModel}
          deleteModel={this.deleteModel}
        />
      ),
      {
        width: "2%",
        isAvailable: () => policy.canCreateDataSource(),
      }
    ),
  ];

  componentDidMount() {
    Promise.all([DataSource.query()])
      .then(values =>
        this.setState(
          {
            dataSources: values[0],
            loading: false,
          }
          )
      )
      .catch(error => this.props.onError(error));
  }

  createModel = values =>
    Model.create(values)
      .then(model => {
        notification.success("Saved.");
        if (model.invite_link) {
          Modal.warning({
            title: "Email not sent!",
            content: (
              <React.Fragment>
                <p>
                  The mail server is not configured, please send the following link to <b>{model.name}</b>:
                </p>
                <InputWithCopy value={absoluteUrl(model.invite_link)} readOnly />
              </React.Fragment>
            ),
          });
        }
      })
      .catch(error => {
        const message = find([get(error, "response.data.message"), get(error, "message"), "Failed saving."], isString);
        return Promise.reject(new Error(message));
      });

  showCreateModelDialog = () => {
    const { dataSources } = this.state;
    if (policy.canCreateDataSource()) {
      const goToModelsList = () => {
        navigateTo("models");
      };
      CreateModelDialog.showModal({ dataSources })
        .onClose(values =>
          this.createModel(values).then(() => {
            this.props.controller.update();
            goToModelsList();
          })
        )
        .onDismiss(goToModelsList);
    }
  };

  enableModel = (event, model) => Model.enableModel(model).then(() => this.props.controller.update());

  disableModel = (event, model) => Model.disableModel(model).then(() => this.props.controller.update());

  deleteModel = (event, model) => Model.deleteModel(model).then(() => this.props.controller.update());

  // eslint-disable-next-line class-methods-use-this
  renderPageHeader() {
    if (!policy.canCreateDataSource()) {
      return null;
    }
    return (
      <div className="m-b-15">
        <Button type="primary" disabled={!policy.canCreateDataSource()} onClick={this.showCreateModelDialog}>
          <i className="fa fa-plus m-r-5" />
          New Model
        </Button>
      </div>
    );
  }

  render() {
    const { controller } = this.props;
    return (
      <React.Fragment>
        {this.renderPageHeader()}
        <div>
          {!controller.isLoaded && <LoadingState className="" />}
          {controller.isLoaded && controller.isEmpty && <EmptyState className="" />}
          {controller.isLoaded && !controller.isEmpty && (
            <div className="table-responsive" data-test="ModelList">
              <ItemsTable
                items={controller.pageItems}
                columns={this.listColumns}
                context={this.actions}
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
          )}
        </div>
      </React.Fragment>
    );
  }
}

const ModelsListPage = wrapSettingsTab(
  "Models.List",
  {
    permission: "admin",
    title: "Models",
    path: "models",
    isActive: path => path.startsWith("/models") && path !== "/models/me",
    order: 2,
  },
  itemsList(
    ModelsList,
    () =>
      new ResourceItemsSource({
        getRequest(request, { params: { currentPage } }) {
          switch (currentPage) {
            case "active":
              request.pending = false;
              break;
            case "pending":
              request.pending = true;
              break;
            case "disabled":
              request.disabled = true;
              break;
            // no default
          }
          return request;
        },
        getResource() {
          return Model.query.bind(Model);
        },
      }),
    () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
  )
);

routes.register(
  "Models.New",
  routeWithUserSession({
    path: "/models/new",
    title: "Models",
    render: pageProps => <ModelsListPage {...pageProps} currentPage="active" isNewModelPage />,
  })
);
routes.register(
  "Models.List",
  routeWithUserSession({
    path: "/models",
    title: "Models",
    render: pageProps => <ModelsListPage {...pageProps} currentPage="active" />,
  })
);
