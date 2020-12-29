import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Modal from "antd/lib/modal";
import Alert from "antd/lib/alert";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import recordEvent from "@/services/recordEvent";
import DataSources from "@/services/data-source";

function CreateModelDialog({ dialog, dataSources, model }) {
  const [error, setError] = useState(null);
  const [dataTable, setDataTable] = useState([]);
  const [statusDataTable, setStatusDataTable] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    recordEvent("view", "page", "model/new");
  }, []);

  const getDataTables = async (id) => {
    try {
      setStatusDataTable(true)
      const response = await DataSources.getTables(id);
      setDataTable(response);
      setStatusDataTable(false);
    } catch (e) {
      setStatusDataTable(false);
    }
  }

  const createModel = useCallback(() => {
    if (formRef.current) {
      formRef.current.validateFieldsAndScroll((err, values) => {
        if (!err) {
          if (model && model.id) {
            values.id = model.id;
          }
          dialog.close(values).catch(setError);
        }
      });
    }
  }, [dialog, statusDataTable]);

  const formFields = useMemo(() => {
    const common = { required: true, props: { onPressEnter: createModel } };
    const optionsConnection = dataSources.map((item) => {
        return {
          name: item.name,
          value: item.id
        }
      })
    const optionsTable = dataTable.map((item) => {
        return {
          name: item.name,
          value: item.name
        }
      })
    if (model)  {
      return [
        { ...common, name: "name", title: "Name", type: "text", autoFocus: true, initialValue: model.name },
        { ...common,
          name: "data_source_id",
          title: "Connection",
          type: "select",
          props: {
            ...common.props,
            onSelect: (selected) => getDataTables(selected)
          },
          options: optionsConnection,
          initialValue: model.data_source_id
        },
        { ...common,
          name: "table",
          title: "Table",
          type: "select",
          options: optionsTable,
          props: {
            ...common.props,
            loading: statusDataTable
          },
          initialValue: model.table }
      ];
    } else {
      return [
        { ...common, name: "name", title: "Name", type: "text", autoFocus: true },
        { ...common,
          name: "data_source_id",
          title: "Connection",
          type: "select",
          props: {
            ...common.props,
            onSelect: (e) => getDataTables(e)
          },
          options: optionsConnection
        },
        { ...common,
          name: "table",
          title: "Table",
          type: "select",
          props: {
            ...common.props,
            loading: statusDataTable
          },
          options: optionsTable }
      ];
    }
  }, [createModel, dataTable, statusDataTable]);
  console.log('CreateModelDialog', statusDataTable);
  console.log('CreateModelDialog', formFields);
  return (
    <Modal {...dialog.props} title={ !model ? 'Create a New Model' : 'Edit a Model'}
           okText={!model ? 'Create' : 'Save'} onOk={createModel}>
      <DynamicForm fields={formFields} ref={formRef} hideSubmitButton />
      {error && <Alert message={error.message} type="error" showIcon />}
    </Modal>
  );
}

CreateModelDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(CreateModelDialog);
