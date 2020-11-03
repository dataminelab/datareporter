import React, {useState, useEffect} from "react";
import { Model } from "@/components/proptypes";
import AceEditor from "react-ace";
import Button from "antd/lib/button";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-textmate";
import {ButtonTooltip} from "@/components/queries/QueryEditor/QueryEditorControls";
import navigateTo from "@/components/ApplicationArea/navigateTo";

export default function EditableModelConfig({model, saveConfig}) {
  const [item, setItem] = useState(model);

  useEffect(() => {
    setItem(model);
  }, [model]);

  const onChange = (config) => {
    const newModel = Object.assign({}, item, {config})
    setItem(newModel);
  }

  const backToList = () => {
    navigateTo('models')
  }

  return (
    <div className="col-md-12">
      <div className="editor-yaml">
        <h1>Edit config
          <ButtonTooltip title={'Cmd + S'}>
            <Button
              className="query-editor-controls-button m-l-5 right"
              onClick={() => saveConfig(item)}
              type={'primary'}
              data-test="SaveButton">
              <span className="fa fa-floppy-o" />&nbsp;Save
            </Button>
            <Button
              className="query-editor-controls-button m-l-5 right"
              onClick={backToList}
              data-test="SaveButton">
              Cancel
            </Button>
          </ButtonTooltip></h1>
        <AceEditor
          mode="yaml"
          width="800px"
          defaultValue={item.config}
          height="700px"
          theme="textmate"
          onChange={onChange}
          name="yaml_editor"
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    </div>
  );
}

EditableModelConfig.propTypes = {
  model: Model.isRequired,
};
