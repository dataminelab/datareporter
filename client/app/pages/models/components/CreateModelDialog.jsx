import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import Alert from "antd/lib/alert";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import recordEvent from "@/services/recordEvent";
import DataSource from "@/services/data-source";
import { Loader } from "@/components/TurniloComponent/client/components/loader/loader";
import { useUniqueId } from "@/lib/hooks/useUniqueId";

import "./CreateModelDialog.css";

function CreateModelDialog({ dialog, dataSources, model }) {
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [loadTables, setLoadTables] = useState(false);
  const tablesLoadingRef = useRef();

  const handleSubmit = useCallback(values => dialog.close(values).catch(setError), [dialog]);
  const formId = useUniqueId("modelForm");

  useEffect(() => {
    recordEvent("view", "page", "model/new");
  }, []);

  const onChangeConnection = useCallback(async (id) => {
    setError(null);
    setLoadTables(true);
    setTables([]);
    // loading animation is here
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
  }, []);


  const formFields = useMemo(() => {
    const common = { required: true};
    const dataSourceProps = { required: true, props: { onSelect: (id) => onChangeConnection(id) } };
    const tableProps = { required: true, props: {disabled: tables.length === 0, loading: loadTables } };
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


  }, [dataSources, loadTables, model, onChangeConnection, tables]);

  return (
    <Modal
      {...dialog.props}
      title={ !model ? 'Create a New Model' : 'Edit a Model'}
      footer={[
        <Button key="cancel" {...dialog.props.cancelButtonProps} onClick={dialog.dismiss} data-test="CreateModelCancelButton">
          Cancel
        </Button>,
        <Button
          key="submit"
          {...dialog.props.okButtonProps}
          htmlType="submit"
          type="primary"
          form={formId}
          data-test="SaveUserButton"
        >
          {!model ? 'Create' : 'Save'}
        </Button>
      ]}
      wrapProps={{
        "data-test": "CreateModelDialog",
      }}>
      <DynamicForm 
        id={formId}
        fields={formFields}
        onSubmit={handleSubmit}
        hideSubmitButton
        feedbackIcons
      />
      <div ref={tablesLoadingRef} style={{opacity: 0}}>
        <Loader />
      </div>
      {error && <Alert message={error.message} type="error" showIcon data-test="CreateModelErrorAlert" />}
    </Modal>
  );
}

CreateModelDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(CreateModelDialog);
