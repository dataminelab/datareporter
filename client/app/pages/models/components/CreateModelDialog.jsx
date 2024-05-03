import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Button from "antd/lib/button";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import Alert from "antd/lib/alert";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import recordEvent from "@/services/recordEvent";
import DataSource from "@/services/data-source";
import { Loader } from "@/components/TurniloComponent/client/components/loader/loader";

import "./CreateModelDialog.css";

function CreateModelDialog({ dialog, dataSources, model }) {
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [loadTables, setLoadTables] = useState(false);
  const tablesLoadingRef = useRef();

  const formRef = useRef();

  useEffect(() => {
    recordEvent("view", "page", "model/new");
  }, []);

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
  }, [dialog]);

  const onChangeConnection = useCallback(async (id) => {
    setError(null);
    setLoadTables(true);
    setTables([]);
    // do loading animation here
    tablesLoadingRef.current.style.opacity = "1";
    try {
      const res = await DataSource.getTables(id);
      setTables(res);
      setLoadTables(false);
    } catch(err) {
      const res = err.response;
      if (res && res.status === 400) {
        const catchedError = new Error(res.data.message);
        setError(catchedError);
      } else {
        setError(err);
      }
      setTables([]);
      setLoadTables(false);
    }
    tablesLoadingRef.current.style.opacity = "0";
  }, [tables]);


  const formFields = useMemo(() => {
    const common = { required: true, props: { onPressEnter: createModel } };
    const dataSourceProps = { required: true, props: { onPressEnter: createModel, onSelect: (id) => onChangeConnection(id) } };
    const tableProps = { required: true, props: {disabled: tables.length === 0, loading: loadTables, onPressEnter: createModel } };
    const optionsConnection = dataSources.map((item) => {
        return {
          name: item.name,
          value: item.id
        }
    })
    const optionsTable = tables.map((item) => {
        return {
          name: item.name,
          value: item.name
        }
    })
    if (model)  {
      return [
        { ...common, name: "name", title: "Name", type: "text", autoFocus: true, initialValue: model.name },
        {...dataSourceProps, name: "data_source_id", title: "Connection", type: "select", options: optionsConnection, initialValue: model.data_source_id },
        { ...tableProps, name: "table", title: "Table", type: "select", options: optionsTable, initialValue: model.table }
      ];
    } else {
      return [
        { ...common, name: "name", title: "Name", type: "text", autoFocus: true },
        { ...dataSourceProps, name: "data_source_id", title: "Connection", type: "select", onChange: onChangeConnection, options: optionsConnection },
        { ...tableProps, name: "table", title: "Table", type: "select", options: optionsTable }
      ];
    }


  }, [createModel, onChangeConnection]);
  console.log("formFields", formFields)
  return (
    <Modal
      {...dialog.props} 
      data-test="CreateModelDialog" 
      title={ !model ? 'Create a New Model' : 'Edit a Model'}
      footer={[
        <Button key="cancel" onClick={() => dialog.dismiss()} data-test="CreateModelCancelButton">
          Cancel
        </Button>,
        <Button key="submit" onClick={()=> createModel()} type="primary">
          {!model ? 'Create' : 'Save'} 
        </Button>,
      ]}
    >
      <DynamicForm fields={formFields} ref={formRef} hideSubmitButton />
      <div ref={tablesLoadingRef} style={{opacity: 0}}>
        <Loader />
      </div>
      {error && <Alert message={error.message} type="error" showIcon />}
    </Modal>
  );
}

CreateModelDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(CreateModelDialog);
