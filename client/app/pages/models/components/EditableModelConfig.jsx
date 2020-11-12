import React, {useState, useEffect} from "react";
import { Model } from "@/components/proptypes";
import AceEditor from "react-ace";
import Button from "antd/lib/button";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-textmate";
import {ButtonTooltip} from "@/components/queries/QueryEditor/QueryEditorControls";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import {filter, fromPairs, isFunction, map, noop} from "lodash";
import KeyboardShortcuts from "@/services/KeyboardShortcuts";

export default function EditableModelConfig({model, saveConfig}) {
  const [item, setItem] = useState(model);

  useEffect(() => {
    setItem(model);
    let buttons = [{shortcut: 'mod+s', onClick: () => saveConfig(item)}];
    const shortcuts = fromPairs(map(buttons, b => [b.shortcut, b.onClick]));
    KeyboardShortcuts.bind(shortcuts);
    return () => {
      KeyboardShortcuts.unbind(shortcuts);
    };
  }, [model, saveConfig]);

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
          <ButtonTooltip title={'Cmd + S'} shortcut={'mod+s'}>
            <Button
              className="query-editor-controls-button m-l-5 right"
              onClick={() => saveConfig(item)}
              type={'primary'}
              data-test="SaveButton">
              <span className="fa fa-floppy-o" />&nbsp;Save
            </Button>
          </ButtonTooltip>
          <Button
            className="query-editor-controls-button m-l-5 right"
            onClick={backToList}
            data-test="SaveButton">
            Cancel
          </Button></h1>
        <AceEditor
          mode="yaml"
          width="800px"
          defaultValue={item.config}
          height="700px"
          theme="textmate"
          onChange={onChange}
          wrapEnabled={true}
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
