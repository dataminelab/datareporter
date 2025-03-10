import { isString, get, find } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import Button from "antd/lib/button";
import SettingOutlinedIcon from "@ant-design/icons/SettingOutlined";
import EditOutlinedIcon from "@ant-design/icons/EditOutlined";
import DeleteOutlinedIcon from "@ant-design/icons/DeleteOutlined";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import Paginator from "@/components/Paginator";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import EmptyState from "@/components/items-list/components/EmptyState";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import wrapSettingsTab from "@/components/SettingsWrapper";

import { policy } from "@/services/policy";
import Model from "@/services/model";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import notification from "@/services/notification";
import routes from "@/services/routes";

import CreateModelDialog from "./components/CreateModelDialog";
import DataSource from "@/services/data-source";

import Modal from "antd/lib/modal";

function ModelsListActions({ model, editModel, editConfigModel, deleteModel }) {
  const doDelete = callback => {
    deleteModel(model)
      .then(() => {
        notification.success("Data source deleted successfully.");
        callback();
      })
      .catch((e) => {
        notification.error(e);
        callback();
      });
  };

  const handleDeleteModel = () => {
    Modal.confirm({
      title: "Delete Data Source",
      content: "Are you sure you want to delete this data source?",
      okText: "Delete",
      okType: "danger",
      onOk: doDelete,
      onCancel: () => {},
      maskClosable: true,
      autoFocusButton: null,
    });
  }
  return <>
    <Button type="ghost" icon={<SettingOutlinedIcon />} className="m-2 inline" onClick={() => editConfigModel(model)}>
      Edit config
    </Button>
    <Button type="dashed" icon={<EditOutlinedIcon />} className="m-2 inline" onClick={() => editModel(model)}>
      Edit
    </Button>
    <Button type="danger"  icon={<DeleteOutlinedIcon />} className="m-2 inline" onClick={() => handleDeleteModel()}>
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
      (text, model) => model.data_source_name,
      {
        title: "Data source",
        field: "data_source_name",
      }
    ),
    Columns.custom(
      (text, model) => (
        <ModelsListActions
          model={model}
          editModel={this.editModel}
          editConfigModel={this.editConfigModel}
          deleteModel={this.deleteModel}
        />
      ),
      {
        width: "30%",
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
        navigateTo(`models/${model.id}`);
        notification.success("Saved.");
      })
      .catch(error => {
        const message = find([get(error, "response.data.message"), get(error, "message"), "Failed saving."], isString);
        return Promise.reject(new Error(message));
      });

  saveModel = (values, id) =>
    Model.save(values, id)
      .then(model => {
        notification.success("Saved.");
      })
      .catch(error => {
        const message = find([get(error, "response.data.message"), get(error, "message"), "Failed saving."], isString);
        return Promise.reject(new Error(message));
      });

  showCreateModelDialog = (e) => {
    e.preventDefault();
    const { dataSources } = this.state;
    if (policy.canCreateDataSource()) {
      const goToModelsList = () => {
        navigateTo("models");
      };

      CreateModelDialog.showModal({ dataSources })
        .onClose(values =>
          this.createModel(values).then(() => {
            this.props.controller.update();
          })
        )
        .onDismiss(goToModelsList);
    }
  };

  editModel = (model) => {
    const { dataSources } = this.state;
    if (policy.canCreateDataSource()) {
      const goToModelsList = () => {
        navigateTo("models");
      };
      CreateModelDialog.showModal({ dataSources, model })
        .onClose(values =>
        {
          this.saveModel(values).then(() => {

            this.props.controller.update();
          })
        }

        )
        .onDismiss(goToModelsList);
    }
  };

  deleteModel = (model) => Model.deleteModel(model).then(() => this.props.controller.update());
  editConfigModel = (model) => navigateTo(`models/${model.id}`);

  // eslint-disable-next-line class-methods-use-this
  renderPageHeader() {
    if (!policy.canCreateDataSource()) {
      return null;
    }
    const newModelProps = {
      type: "primary",
      disabled: !policy.canCreateDataSource(),
      onClick: this.showCreateModelDialog
    };
    return (
      <div className="m-b-15">
        <Button {...newModelProps}
          data-test="CreateModelButton"
        >
          <i className="fa fa-plus m-r-5 aka" />
          New Model
        </Button>
      </div>
    );
  }

  render() {
    const { controller } = this.props;
    const emptyMessage = "There are no models to view yet";
    return (
      <React.Fragment>
        {this.renderPageHeader()}
        <div>
          {!controller.isLoaded && <LoadingState className="" />}
          {controller.isLoaded && controller.isEmpty && <EmptyState message={emptyMessage} className="" />}
          {controller.isLoaded && !controller.isEmpty && (
            <div className="table-responsive" data-test="ModelList">
              <ItemsTable
                dataTest="CreateModelLink"
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

