import React, {useState, useEffect} from "react";
import { Model } from "@/components/proptypes";
import AceEditor from "react-ace";
import Button from "antd/lib/button";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-monokai";

export default function EditableModelConfig({model, saveConfig}) {
  const [item, setItem] = useState(model);

  useEffect(() => {
    setItem(model);
  }, [model]);

  const onChange = (config) => {
    const newModel = Object.assign({}, item, {config})
    setItem(newModel);
  }

  return (
    <div className="col-md-12">
      <div className="editor-yaml">
        <h1>Edit config <Button onClick={() => saveConfig(item)} type={'primary'}>Save</Button></h1>
        <AceEditor
          mode="yaml"
          width="800px"
          defaultValue={item.config}
          height="700px"
          theme="monokai"
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
