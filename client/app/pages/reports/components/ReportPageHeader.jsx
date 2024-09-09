import { extend, map, filter, reduce } from "lodash";
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import PropTypes, { any } from "prop-types";
import Tooltip from "antd/lib/tooltip";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import useMedia from "use-media";
import EditInPlace from "@/components/EditInPlace";
import FavoritesControl from "@/components/FavoritesControl";
import reactCSS from "reactcss";
import { SketchPicker } from "react-color";
import useReportFlags from "../hooks/useReportFlags";
import useArchiveReport from "../hooks/useArchiveReport";
import useDeleteReport from "../hooks/useDeleteReport";
import usePublishReport from "../hooks/usePublishReport";
import useUnpublishReport from "../hooks/useUnpublishReport";
import useDuplicateReport from "../hooks/useDuplicateReport";
import useUpdateReport from "../hooks/useUpdateReport";
import useUpdateReportTags from "../hooks/useUpdateReportTags";
import useApiKeyDialog from "../hooks/useApiKeyDialog";
import usePermissionsEditorDialog from "../hooks/usePermissionsEditorDialog";
import "./ReportPageHeader.less";
import Select from "antd/lib/select";
import useReportDataSources from "@/pages/reports/hooks/useReportDataSources";
import recordEvent from "@/services/recordEvent";
import useReport from "@/pages/reports/hooks/useReport";
import Model from "@/services/model";
import { QueryTagsControl } from "@/components/tags-control/TagsControl";
import { replaceHash, hexToRgb, setPriceButton } from "../components/ReportPageHeaderUtils";
import getTags from "@/services/getTags";
import { reportPageStyles } from "./reportPageStyles";

function getQueryTags() {
  return getTags("api/reports/tags").then(tags => map(tags, t => t.name));
}

function buttonType(value) {
  return value ? "primary" : "default";
}

function createMenu(menu) {
  const handlers = {};

  const groups = map(menu, group =>
    filter(
      map(group, (props, key) => {
        props = extend({ isAvailable: true, isEnabled: true, onClick: () => {} }, props);
        if (props.isAvailable) {
          handlers[key] = props.onClick;
          return (
            <Menu.Item key={key} disabled={!props.isEnabled}>
              {props.title}
            </Menu.Item>
          );
        }
        return null;
      })
    )
  );

  return (
    <Menu onClick={({ key }) => handlers[key]()}>
      {reduce(
        filter(groups, group => group.length > 0),
        (result, items, key) => {
          const divider = result.length > 0 ? <Menu.Divider key={`divider${key}`} /> : null;
          return [...result, divider, ...items];
        },
        []
      )}
    </Menu>
  );
}

export function setColorElements(chartTextColor, chartColor, chartBorderColor) {
  if (chartTextColor) {
    document.documentElement.style.setProperty("--text-default-color", chartTextColor);
  } else if (chartTextColor === undefined) {
    document.documentElement.style.removeProperty("--text-default-color");
  }
  if (chartColor) {
    document.documentElement.style.setProperty("--background-brand-light", chartColor);
  } else if (chartColor === undefined) {
    document.documentElement.style.removeProperty("--background-brand-light");
  }
  if (chartBorderColor) {
    document.documentElement.style.setProperty("--highlight-border", chartBorderColor);
  } else if (chartBorderColor === undefined) {
    document.documentElement.style.removeProperty("--highlight-border");
  }
}

export default function ReportPageHeader(props) {
  const isDesktop = useMedia({ minWidth: 768 });
  const { report, setReport, saveReport, saveAsReport, showShareReportDialog } = useReport(props.report);
  const queryFlags = useReportFlags(report, props.dataSource);
  const updateTags = useUpdateReportTags(report, setReport);
  const archiveReport = useArchiveReport(report, setReport);
  const deleteReport = useDeleteReport(report, setReport);
  const publishReport = usePublishReport(report, setReport);
  const unpublishReport = useUnpublishReport(report, setReport);
  const [isDuplicating, duplicateReport] = useDuplicateReport(report);
  const openApiKeyDialog = useApiKeyDialog(report, setReport);
  const openPermissionsEditorDialog = usePermissionsEditorDialog(report);
  const { dataSourcesLoaded, dataSources, dataSource } = useReportDataSources(report);
  const [models, setModels] = useState([]);
  const [modelsLoaded, setLoadModelsLoaded] = useState(false);
  const reportFlags = useReportFlags(report, dataSource);
  const [currentHash, setCurrentHash] = useState(null);
  const updateReport = useUpdateReport(report, setReport);
  const [displayColorPicker, setDisplayColorPicker] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [colorBodyHex, setColorBodyHex] = useState("#f17013");
  const [colorTextHex, setColorTextHex] = useState("#000");
  const reportChanged = props.reportChanged;
  const setReportChanged = props.setReportChanged;
  const [reportName, setReportName] = useState(report.name);
  const [newName, setNewName] = useState("Copy of " + report.name);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const modelSelectElement = useRef();
  const modelSelectElementText = useRef("");
  const showShareButton = report.publicAccessEnabled || !queryFlags.isNew;

  const handleReportChanged = useCallback((state) => {
    if (!report.data_source_id) return;
    if (!report.model_id) return;
    setReportChanged(state);
  });

  const handleNewNameChange = (event) => {
    setNewName(event.target.value);
  }
  // delete spesific color
  const styles = useMemo(() => reactCSS(reportPageStyles(colorTextHex, colorBodyHex), [colorTextHex, colorBodyHex]));

  const handleColorChange = useCallback( (color, type) => {
      if (!color.rgb && color.startsWith("#")) {
        color = {
          rgb: hexToRgb(color),
          hex: color,
        };
      }
      if (!color.rgb || !color.hex) {
        return 0;
      }
      if (type === 2) {
        setColorBodyHex(color.hex);
        let updates = { color_1: color.hex };
        props.onChange(extend(report.clone(), updates));
        // ligten color
        const amount = 20;
        const lightenedRed = Math.min(255, Math.round(color.rgb.r + (amount / 100) * (255 - color.rgb.r)));
        const lightenedGreen = Math.min(255, Math.round(color.rgb.g + (amount / 100) * (255 - color.rgb.g)));
        const lightenedBlue = Math.min(255, Math.round(color.rgb.b + (amount / 100) * (255 - color.rgb.b)));
        // Convert RGB components back to hex color string
        const lightenedHexColor = `#${lightenedRed.toString(16)}${lightenedGreen.toString(16)}${lightenedBlue.toString(16)}`;
        setColorElements(false, color.hex, lightenedHexColor);
      } else {
        setColorTextHex(color.hex);
        let updates = { color_2: color.hex };
        props.onChange(extend(report.clone(), updates));
        setColorElements(color.hex, false, false); 
      }
      handleReportChanged(true);
    },
    [report, props.onChange]
  );

  const changeModelDataText = (text) => {
    const elem = document.querySelector("#model-data-source").querySelector("span");
    if (elem.innerText === text) return;
    if (elem.innerText !== modelSelectElement.current.props.placeholder) {
      modelSelectElementText.current = elem.innerText;
    }
    elem.innerText = text;
    modelSelectElement.current.focus();
  }

  const setNewModels = async (data_source_id) => {
    var newModels = [];
    const res = await Model.query({ data_source: data_source_id });
    newModels = res.results;
    const updates = {
      data_source_id,
      isJustLanded: false,
    }
    setModels(newModels);
    return updates;
  }

  const handleDataSourceChange = useCallback(
    async (data_source_id, signal) => {
      changeModelDataText(modelSelectElement.current.props.placeholder);
      setLoadModelsLoaded(false);
      if (signal && signal.aborted) return;
      try {
        let updates = await setNewModels(data_source_id);
        props.onChange(extend(report.clone(), { ...updates }));
        updateReport(updates, { successMessage: null, errorMessage: null });
        handleReportChanged(true);
        recordEvent("update", "report", report.id, { data_source_id });
      } catch (err) {
        updateReport({}, { successMessage: err });
        recordEvent("error", "report", report.id, { data_source_id });
      }
      setLoadModelsLoaded(true);
      setSelectedDataSource(data_source_id);
    },
    [report, props.onChange, updateReport]
  );

  const getModel = (modelId) => {
    return models.find(m => m.id === modelId);
  }

  const getModelDataCube = async (modelId) => {
    const settings = await getSettings(modelId);
    const model = getModel(modelId);
    if (!model || !settings) return {};
    const dataCubes = settings.appSettings.dataCubes
    return dataCubes.find(m => m.name === model.table);
  }

  const getSettings = async (modelId) => {
    var settings;
    if (report.isJustLanded) {
      settings = { appSettings: report.appSettings, timekeeper: {} };
    } else {
      settings = await Model.getReporterConfig(modelId);
    }
    return settings;
  }

  const handleModelChange = useCallback(
    async (modelId, signal) => {
      try {
        const modelDataCube = await getModelDataCube(modelId);
        if (!modelDataCube.timeAttribute) {
          // Revert previous changes like make selected model name to previous one and so on
          return updateReport({}, { successMessage: null, errorMessage: "DataCube must have a timeAttribute" });
        }
        const settings = await getSettings(modelId);
        const model = getModel(modelId);
        if (model && model.id !== report.model_id) {
          replaceHash(model, window.location.hash.split("/4/")[1]);
        }
        recordEvent("update", "report", report.id, { modelId });
        var updates = {
          model_id: modelId,
          appSettings: settings.appSettings,
          timekeeper: settings.timekeeper,
          isJustLanded: false,
        };
        if (report.data_source_id) {
          updates.data_source_id = report.data_source_id;
        } else if (selectedDataSource) {
          updates.data_source_id = selectedDataSource;
        }
        if (signal && signal.aborted) return;
        updateReport({...report.clone(), ...updates}, { successMessage: null, errorMessage: null });
        props.onChange(extend(report.clone(), { ...updates }));
        handleReportChanged(true);
        setSelectedModel(modelId);
      } catch (err) {
        updateReport({}, { successMessage: null, errorMessage: "failed to load the model" });
      }
    },
    [report, props.onChange, updateReport]
  );

  const handleIdChange = useCallback(async id => {
    recordEvent("update", "report", report.id, { id });
    setReport(extend(report.clone(), { id }));
    updateReport({ id }, { successMessage: null, errorMessage: null });
    handleReportChanged(true);
  });

  const handleUpdateName = useCallback( name => {
      setReportName(name);
      setNewName("Copy of " + name);
      handleReportChanged(true);
    },[report.id, report.is_draft]
  );

  const handleGivenModal = (id) => {
    try {
      if (document.getElementById(id).style.opacity === "1") {
        document.getElementById(id).style.opacity = "0";
        document.getElementById(id).style["z-index"] = "-1";
      } else {
        document.getElementById(id).style.opacity = "1";
        document.getElementById(id).style["z-index"] = "10";
      }
    } catch {console.warn("modal doesn't exist on this page.")}
  }

  useEffect(() => {
    // this function is waiting for page to render again for saving report after handleSaveReport click
    if (saveButtonClicked && !report.id) saveReport();
  }, [saveButtonClicked]);


  const handleSaveReport = () => {
    if (window.location.hash.substring(window.location.hash.indexOf("4/") + 2)) {
      updateReport({
        expression: window.location.hash.substring(window.location.hash.indexOf("4/") + 2),
        color_1: colorBodyHex || report.color_1,
        color_2: colorTextHex || report.color_2,
        name: reportName,
      }, { successMessage: "Report updated", errorMessage: null });
      recordEvent("update", "report", report.id);
      setSaveButtonClicked(true);
    } else {
      updateReport({
        color_1: colorBodyHex || report.color_1,
        color_2: colorTextHex || report.color_2,
        is_draft: false,
        name: reportName
      }, { successMessage: "Report updated", errorMessage: null });
      recordEvent("create", "report", report.id);
    }
    setReportChanged(false);
  }

  const moreActionsMenu = useMemo(() => createMenu([
      {
        downloadCSV: {
          isAvailable: true,
          title: "Download as CSV File",
          onClick: () => {document.querySelector("#export-data-csv").click()},
        },
        downloadTSV: {
          isAvailable: true,
          title: "Download as TSV File",
          onClick: () => {document.querySelector("#export-data-tsv").click()},
        },
        showAPIKey: {
          isAvailable: !queryFlags.isNew,
          title: "Show API Key",
          onClick: openApiKeyDialog,
        },
      },
    ]),
    [
      queryFlags.isNew,
      queryFlags.canFork,
      queryFlags.canEdit,
      queryFlags.isArchived,
      queryFlags.isDraft,
      isDuplicating,
      duplicateReport,
      archiveReport,
      openPermissionsEditorDialog,
      isDesktop,
      publishReport,
      unpublishReport,
      openApiKeyDialog,
    ]
  );


  useEffect(() => {
    if (dataSourcesLoaded && !selectedDataSource && dataSources.length) handleDataSourceChange(dataSources[0].id);
  }, [dataSourcesLoaded]);
  
  useEffect(() => {
    
    if (report.isJustLanded) {
      if (colorTextHex !== report.color_2) handleColorChange(report.color_2, 1);
      if (colorBodyHex !== report.color_1) handleColorChange(report.color_1, 2);
      if (report.data_source_id !== selectedDataSource) {
        setNewModels(report.data_source_id);
        setSelectedDataSource(report.data_source_id);
      }
      if (report.model_id !== selectedModel) {
        setSelectedModel(report.model_id);
        setLoadModelsLoaded(true);
      }
      setPriceButton(
        Number(localStorage.getItem(`${window.location.pathname}-price`)), 
        Number(localStorage.getItem(`${window.location.pathname}-proceed_data`)), 
        false);
        handleReportChanged(false); // fix this, we cant set get here save button is not working disabling and stuff
    }
  }, []);

  useEffect(() => {
    if (window.location.href.indexOf("4/") > -1) setCurrentHash(window.location.hash);
  }, []);

  useEffect(() => {
    if (!currentHash) return;
    if (!dataSources) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    const setData = async (dataSourceId, modelId) => {
      if (signal.aborted) return;
      await handleDataSourceChange(dataSourceId, signal);
      if (signal.aborted) return; 
      const modelDataCube = await getModelDataCube(modelId);
      if (!modelDataCube.timeAttribute) return null;
      await handleModelChange(modelId, signal)
        .then(() => {
          if (signal.aborted) return;
          setTimeout(() => {
            window.location.hash = currentHash;
            setCurrentHash(null);
          }, 133);
        });
    }

    const baseDataSource = currentHash.split("/")[0].replace("#", "");
    for (let i = 0; i < dataSources.length; i++) {
      const dataSource = dataSources[i];
      const tables = dataSource.tables;
      const table_ids = dataSource.table_ids;
      for (let i = 0; i < tables.length; i++) {
        if (tables[i] === baseDataSource) {
          setData(dataSource.id, table_ids[i]);
          return;
        }
      }
    }

    return () => {
      abortController.abort();
    }
  }, [dataSourcesLoaded]);


  useEffect(() => {
    // this function is working on report/new page for setting first model to report
    if (report.isJustLanded) return;
    const firstEncounterModelSetter = async (models) => {
      const modelId = models[0].id;      
      const modelDataCube = await getModelDataCube(modelId);
      if (!modelDataCube) return;
      if (!modelDataCube.timeAttribute) return;
      handleModelChange(modelId);
      const model = getModel(modelId);
      replaceHash(model, window.location.hash.split("/4/")[1]);
    }
    if (modelsLoaded && !selectedModel && models.length) firstEncounterModelSetter(models);
  }, [modelsLoaded]);

  return (
    <div className="report-page-header">
      <div className="title-with-tags m-l-5">
        <div className="page-title">
          <div className="d-flex align-items-center">
            {!queryFlags.isNew && <FavoritesControl item={report} />}
            <h3>
              <EditInPlace isEditable={queryFlags.canEdit} onDone={handleUpdateName} ignoreBlanks value={reportName} />
            </h3>
          </div>
        </div>
        <div className="query-tags">
          <QueryTagsControl
            tags={report.tags}
            isDraft={queryFlags.isDraft}
            isArchived={queryFlags.isArchived}
            canEdit={queryFlags.canEdit}
            getAvailableTags={getQueryTags}
            onEdit={updateTags}
            tagsExtra={props.tagsExtra}
          />
        </div>
      </div>
      <div className="header-actions">
        {props.headerExtra}
        <div>
          <Button className="ant-menu-submenu-title m-r-5" id="meta-button" onClick={() => handleGivenModal("meta-modal")}>
            <span className="icon icon-ribbon m-r-5"></span>Meta
          </Button>
              <ul
                id="meta-modal"
                className="ant-menu ant-menu-sub ant-menu-hidden ant-menu-vertical"
                role="menu"
                onClick={e => e.stopPropagation()}>
                <div style={styles.cover} onClick={() => handleGivenModal("meta-modal")} />
                <li className="ant-menu-item modal-left" role="menuitem">
                  <p id="_price" alt="0">
                    Price: 0
                  </p>
                </li>
                <li className="ant-menu-item modal-right" role="menuitem">
                  <p id="_proceed_data" alt="0">
                    Bytes: 0
                  </p>
                </li>
              </ul>
          </div>
        <Button style={styles.swatch} className="m-r-5" onClick={() => setDisplayColorPicker(1)}>
          <span style={styles.colorSpanElement}>Text</span>
          <div style={styles.color} />
        </Button>
        <Button style={styles.swatch} className="m-r-5" onClick={() => setDisplayColorPicker(2)}>
          <span style={styles.colorSpanElement}>Chart</span>
          <div style={styles.colorBody} />
        </Button>
        {displayColorPicker === 1 ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={() => setDisplayColorPicker(0)} />
            <SketchPicker color={colorTextHex} onChangeComplete={color => handleColorChange(color, 1)} />
          </div>
        ) : null}
        {displayColorPicker === 2 ? (
          <div style={styles.popoverSecond}>
            <div style={styles.cover} onClick={() => setDisplayColorPicker(0)} />
            <SketchPicker color={colorBodyHex} onChangeComplete={color => handleColorChange(color, 2)} />
          </div>
        ) : null}
        <div className="data-source-box m-r-10">
          <span className="icon icon-datasource m-r-5"></span>
          <Select
            data-test="SelectDataSource"
            placeholder="Choose base data source..."
            value={selectedDataSource}
            disabled={(!reportFlags.canEdit || !dataSourcesLoaded || dataSources.length === 0) ? true : false}
            loading={!dataSourcesLoaded}
            optionFilterProp="data-name"
            showSearch
            onChange={handleDataSourceChange}>
            {map(dataSources, ds => (
              <Select.Option
                key={`ds-${ds.id}`}
                value={ds.id}
                data-name={ds.name}
                data-test={`SelectDataSource${ds.id}`}>
                <img src={`/static/images/db-logos/${ds.type}.png`} width="20" alt={ds.name} />
                <span>{ds.name}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="data-source-box m-r-10">
          <span className="icon icon-datasource m-r-5"></span>
          <Select
            data-test="SelectModel"
            placeholder="Choose model data source..."
            id="model-data-source"
            value={report ? report.model_id : undefined} 
            disabled={(report.id || (!reportFlags.canEdit || !modelsLoaded || models.length === 0)) ? true : false}
            loading={!modelsLoaded}
            optionFilterProp="data-name"
            showSearch
            ref={modelSelectElement}
            onChange={handleModelChange}> 
            {map(models, m => (
              <Select.Option key={`ds-${m.id}`} value={m.id} data-name={m.name} data-test={`SelectModel${m.id}`}>
                <span>{m.name}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
        {isDesktop && !queryFlags.isArchived && !queryFlags.isNew && queryFlags.canEdit && (
            <Button className="m-r-5" onClick={archiveReport}>
              <i className="fa fa-paper-plane m-r-5" /> Archive
            </Button>
        )}
        {!queryFlags.isNew && queryFlags.canEdit && (
          <Button className="m-r-5" onClick={deleteReport}>
            <i className="fa fa-trash m-r-5" /> Delete
          </Button>
        )}

        {showShareButton && (
            <Tooltip title="Report Sharing Options">
              <Button
                className="icon-button m-r-5"
                type={buttonType(report.publicAccessEnabled)}
                onClick={showShareReportDialog}
                data-test="OpenShareForm">
                <i className="zmdi zmdi-share" />
              </Button>
            </Tooltip>
          )}

        {!queryFlags.isNew && (
          <span>
            {!props.sourceMode && (
              <Button className="m-r-5" href={report.getUrl(true, props.selectedVisualization)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true" />
                <span className="m-l-5">Edit Source</span>
              </Button>
            )}
          </span>
        )}
          <Button disabled={!reportChanged} className="m-r-5" id="_handleSaveReport" onClick={() => handleSaveReport()}>
            <span className="icon icon-save-floppy-disc m-r-5"></span> Save
          </Button>
        {(report.id) && (
          <>
            <Button className="m-r-5" id="_handleSaveAs" onClick={() => handleGivenModal("save-as-ul")}>
              Save as...
            </Button>
            <ul
              id="save-as-ul"
              className="ant-menu ant-menu-sub ant-menu-hidden ant-menu-vertical"
              role="menu"
              onClick={e => e.stopPropagation()}
            >
              <p className="new-name-label">name</p>
              <input className="new-name-input" type="text" value={newName} onChange={handleNewNameChange} />
              <Button className="ant-menu-item-group-title" onClick={() => saveAsReport(newName)}>Save now</Button>
            </ul>
          </>
        )}         
        <Dropdown disabled={(report.id || report.model_id) ? false : true} overlay={moreActionsMenu} trigger={["click"]}>
          <Button>
            <Icon type="ellipsis" rotate={90} />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}

ReportPageHeader.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string | PropTypes.number,
    name: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  dataSource: PropTypes.array,
  sourceMode: PropTypes.bool,
  selectedVisualization: PropTypes.number,
  headerExtra: PropTypes.node,
  tagsExtra: PropTypes.node,
  onChangeColor: PropTypes.func,
  reportChanged: any,
  setReportChanged: PropTypes.func,
}

ReportPageHeader.defaultProps = {
  dataSource: null,
  sourceMode: false,
  selectedVisualization: null,
  headerExtra: null,
  tagsExtra: null,
  onChangeColor: () => {},
  reportChanged: null,
  setReportChanged: () => {},
}
