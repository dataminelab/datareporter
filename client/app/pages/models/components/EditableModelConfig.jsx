import React, {useState, useEffect} from "react";
import { Model } from "@/components/proptypes";
import AceEditor from "react-ace";
import Button from "antd/lib/button";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-textmate";
import {ButtonTooltip} from "@/components/queries/QueryEditor/QueryEditorControls";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import {fromPairs, map} from "lodash";
import KeyboardShortcuts from "@/services/KeyboardShortcuts";
import ModelService from "@/services/model";
import ModelConfigDocs from "./ModelConfigDocs";

import axios from "axios";

export default function EditableModelConfig({model, saveConfig}) {
  const configYAML = "customization:\n" +
    "  urlShortener: |\n" +
    "    return request.get('http://tinyurl.com/api-create.php?url=' + encodeURIComponent(url))\n" +
    "dataCubes:\n" +
    "  - name: wiki\n" +
    "    title: Wikipedia Example\n" +
    "    description: |\n" +
    "      Data cube with *Wikipedia* data.\n" +
    "      ---\n" +
    "      Contains data about Wikipedia editors and articles with information about edits, comments and article metadata\n" +
    "\n" +
    "      *Based on wikiticker from 2015-09-12*\n" +
    "    clusterName: native\n" +
    "    source: assets/data/wikiticker-2015-09-12-sampled.json\n" +
    "    timeAttribute: time\n" +
    "\n" +
    "    refreshRule:\n" +
    "      rule: fixed\n" +
    "      time: 2015-09-13T00:00:00.000Z\n" +
    "\n" +
    "    defaultDuration: P1D\n" +
    "    defaultSortMeasure: added\n" +
    "    defaultSelectedMeasures: [\"added\"]\n" +
    "\n" +
    "    defaultPinnedDimensions: [\"channel\",\"namespace\",\"isRobot\"]\n" +
    "    introspection: no-autofill\n" +
    "    attributeOverrides:\n" +
    "      - name: sometimeLater\n" +
    "        type: TIME\n" +
    "\n" +
    "      - name: commentLength\n" +
    "        type: NUMBER\n" +
    "\n" +
    "      - name: deltaBucket100\n" +
    "        type: NUMBER\n" +
    "\n" +
    "    dimensions:\n" +
    "      - name: time\n" +
    "        title: Time\n" +
    "        kind: time\n" +
    "        formula: $time\n" +
    "\n" +
    "      - name: channel\n" +
    "        title: Channel\n" +
    "        formula: $channel\n" +
    "\n" +
    "      - name: cityName\n" +
    "        title: City Name\n" +
    "        formula: $cityName\n" +
    "\n" +
    "      - name: comments\n" +
    "        title: Comments\n" +
    "        dimensions:\n" +
    "\n" +
    "          - name: comment\n" +
    "            title: Comment\n" +
    "            formula: $comment\n" +
    "\n" +
    "          - name: commentLengths\n" +
    "            title: Comment Lengths\n" +
    "            description: Length of the comment\n" +
    "            dimensions:\n" +
    "\n" +
    "              - name: commentLength\n" +
    "                title: Comment Length\n" +
    "                kind: number\n" +
    "                description: |\n" +
    "                  Lengths of *all* comments\n" +
    "                formula: $commentLength\n" +
    "\n" +
    "              - name: commentLengthOver100\n" +
    "                title: Comment Length Over 100\n" +
    "                description: |\n" +
    "                  `true` only if comment length is over `100`\n" +
    "                kind: boolean\n" +
    "                formula: $commentLength > 100\n" +
    "\n" +
    "      - name: countryIso\n" +
    "        title: Country ISO\n" +
    "        formula: $countryIsoCode\n" +
    "\n" +
    "      - name: countryName\n" +
    "        title: Country Name\n" +
    "        formula: $countryName\n" +
    "\n" +
    "      - name: deltaBucket100\n" +
    "        title: Delta Bucket\n" +
    "        kind: number\n" +
    "        formula: $deltaBucket100\n" +
    "\n" +
    "      - name: isAnonymous\n" +
    "        title: Is Anonymous\n" +
    "        kind: boolean\n" +
    "        formula: $isAnonymous\n" +
    "\n" +
    "      - name: isMinor\n" +
    "        title: Is Minor\n" +
    "        kind: boolean\n" +
    "        formula: $isMinor\n" +
    "\n" +
    "      - name: isNew\n" +
    "        title: Is New\n" +
    "        kind: boolean\n" +
    "        formula: $isNew\n" +
    "\n" +
    "      - name: isRobot\n" +
    "        title: Is Robot\n" +
    "        kind: boolean\n" +
    "        formula: $isRobot\n" +
    "\n" +
    "      - name: isUnpatrolled\n" +
    "        title: Is Unpatrolled\n" +
    "        formula: $isUnpatrolled\n" +
    "\n" +
    "      - name: metroCode\n" +
    "        title: Metro Code\n" +
    "        formula: $metroCode\n" +
    "\n" +
    "      - name: namespace\n" +
    "        title: Namespace\n" +
    "        formula: $namespace\n" +
    "\n" +
    "      - name: page\n" +
    "        title: Page\n" +
    "        formula: $page\n" +
    "\n" +
    "      - name: regionIso\n" +
    "        title: Region ISO\n" +
    "        formula: $regionIsoCode\n" +
    "\n" +
    "      - name: regionName\n" +
    "        title: Region Name\n" +
    "        formula: $regionName\n" +
    "\n" +
    "      - name: user\n" +
    "        title: User\n" +
    "        formula: $user\n" +
    "\n" +
    "      - name: userChars\n" +
    "        title: User Chars\n" +
    "        formula: $userChars\n" +
    "\n" +
    "    measures:\n" +
    "      - name: rowsAndDeltas\n" +
    "        title: Rows & Deltas\n" +
    "        measures:\n" +
    "\n" +
    "          - name: count\n" +
    "            title: Rows\n" +
    "            formula: $main.count()\n" +
    "\n" +
    "          - name: deltas\n" +
    "            title: Deltas\n" +
    "            measures:\n" +
    "\n" +
    "              - name: delta\n" +
    "                title: Delta\n" +
    "                formula: $main.sum($delta)\n" +
    "\n" +
    "              - name: avg_delta\n" +
    "                title: Avg Delta\n" +
    "                formula: $main.average($delta)\n" +
    "\n" +
    "      - name: added\n" +
    "        title: Added\n" +
    "        description: |\n" +
    "          Sum of all additions\n" +
    "        formula: $main.sum($added)\n" +
    "\n" +
    "      - name: avg_added\n" +
    "        title: Avg Added\n" +
    "        formula: $main.average($added)\n" +
    "\n" +
    "      - name: deleted\n" +
    "        title: Deleted\n" +
    "        description: |\n" +
    "          Sum of all deletions\n" +
    "        formula: $main.sum($deleted)\n" +
    "\n" +
    "      - name: avg_deleted\n" +
    "        title: Avg Deleted\n" +
    "        formula: $main.average($deleted)\n" +
    "\n" +
    "      - name: unique_users\n" +
    "        title: Unique Users\n" +
    "        formula: $main.countDistinct($user)\n"

  const [item, setItem] = useState('');

  const getConfigModel = async () => {
    const modelConfig = await ModelService.getConfig(model.model_config_id);
    setItem(modelConfig.content);
  }

  const save = () => saveConfig(model.id, item)
  const handleSaveConfig = (callback) => {
    const yamlContent =  item;
    if (!yamlContent.includes("timeAttribute") || yamlContent.includes("timeAttribute: null")) {
      alert("your time attribute variable is null");
      return;
    }
    const timeAttribute = yamlContent.split("timeAttribute: ")[1].split("\n")[0];
    const attributes = yamlContent.split("attributes:")[1].split("dimensions:")[0];
    // if timeAttribute is not in attributes, then alert
    if (!attributes.includes(timeAttribute)) {
      alert("your time attribute variable is not in attributes list");
      return;
    }
    // if timeAttribute's type is not TIME then alert 
    const attributesList = attributes.split("- name: ");
    attributesList.shift();
    for (let i = 0; i < attributesList.length; i++) {
      const attribute = attributesList[i];
      if (attribute.includes(timeAttribute)) {
        const attributeType = attribute.split("type: ")[1].split("\n")[0];
        if (attributeType !== "TIME") {
          alert("your time attribute variable's type is not a time or timestamp");
          return;
        }
      }
    }
    callback();
  }

  useEffect( () => {
    if (model.model_config_id) {
      getConfigModel();
    } else {
      setItem(configYAML);
    }
  }, [model]);

  useEffect( () => {
    let buttons = [{shortcut: 'mod+s', onClick: () => saveConfig(model.id, item)}];
    const shortcuts = fromPairs(map(buttons, b => [b.shortcut, b.onClick]));
    KeyboardShortcuts.bind(shortcuts);
    return () => {
      KeyboardShortcuts.unbind(shortcuts);
    };
  }, [item, saveConfig]);

  const onChange = (config) => {
    setItem(config);
  }

  const backToList = () => {
    navigateTo('models')
  }


  return (
    <div className="col-md-12">
      <div className="editor-yaml-box">
        <div className="editor-yaml">
          <h1>{model.name} | edit config
            <ButtonTooltip title={'Cmd + S'} shortcut={'mod+s'}>
              <Button
                className="query-editor-controls-button m-l-5 right"
                onClick={handleSaveConfig.bind(this, save)}
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
            defaultValue={item}
            value={item}
            height="700px"
            theme="textmate"
            onChange={onChange}
            wrapEnabled={true}
            name="yaml_editor"
            editorProps={{ $blockScrolling: true }}
          />
        </div>
        <div className="editor-yaml-docs">
          <ModelConfigDocs />
        </div>
      </div>
    </div>
  );
}

EditableModelConfig.propTypes = {
  model: Model.isRequired,
};
