import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Modal from "antd/lib/modal";
import Alert from "antd/lib/alert";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import recordEvent from "@/services/recordEvent";

function CreateModelDialog({ dialog, dataSources }) {
  const [error, setError] = useState(null);
  const formRef = useRef();

  useEffect(() => {
    recordEvent("view", "page", "users/new");
  }, []);

  const createModel = useCallback(() => {
    if (formRef.current) {
      formRef.current.validateFieldsAndScroll((err, values) => {
        if (!err) {
          dialog.close(values).catch(setError);
        }
      });
    }
  }, [dialog]);

  const formFields = useMemo(() => {
    const common = { required: true, props: { onPressEnter: createModel } };
    const optionsConnection = dataSources.map((item) => {
        return {
          name: item.name,
          value: item.id
        }
      })
    return [
      { ...common, name: "name", title: "Name", type: "text", autoFocus: true },
      { ...common, name: "connection", title: "Connection", type: "select", options: optionsConnection },
      { ...common, name: "schemas", title: "Schemas", type: "text", required: false },
      { ...common, name: "ignore_prefixes", title: "Ignore Prefixes", type: "text", required: false },
    ];
  }, [createModel]);

  return (
    <Modal {...dialog.props} title="Create a New Model" okText="Create" onOk={createModel}>
      <DynamicForm fields={formFields} ref={formRef} hideSubmitButton />
      {error && <Alert message={error.message} type="error" showIcon />}
    </Modal>
  );
}

CreateModelDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(CreateModelDialog);
