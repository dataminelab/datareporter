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
import usePublishReport from "../hooks/usePublishReport";
import useUnpublishReport from "../hooks/useUnpublishReport";
import useDuplicateReport from "../hooks/useDuplicateReport";
import useUpdateReport from "../hooks/useUpdateReport";
import useUpdateReportTags from "../hooks/useUpdateReportTags";
import useApiKeyDialog from "../hooks/useApiKeyDialog";
import usePermissionsEditorDialog from "../hooks/usePermissionsEditorDialog";
import useColorsReport from "@/pages/reports/hooks/useColorsReport";
import "./ReportPageHeader.less";
import Select from "antd/lib/select";
import useReportDataSources from "@/pages/reports/hooks/useReportDataSources";
import recordEvent from "@/services/recordEvent";
import useReport from "@/pages/reports/hooks/useReport";
import Model from "@/services/model";
import { QueryTagsControl } from "@/components/tags-control/TagsControl";
import { replaceHash, hexToRgb, setPriceButton } from "../components/ReportPageHeaderUtils";
import getTags from "@/services/getTags";

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
  const { report, setReport, saveReport, saveAsReport, deleteReport, showShareReportDialog } = useReport(props.report);
  const queryFlags = useReportFlags(report, props.dataSource);
  const updateTags = useUpdateReportTags(report, setReport);
  const archiveReport = useArchiveReport(report, setReport);
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
  const updateColors = useColorsReport(report, setReport);
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
  const modelSelectElement = useRef();
  const modelSelectElementText = useRef("");
  const showShareButton = report.publicAccessEnabled || !queryFlags.isNew;

  const handleReportChanged = (state) => {
    if (!report.data_source_id) return;
    if (!report.model_id) return;
    setReportChanged(state);
  }

  const handleNewNameChange = (event) => {
    setNewName(event.target.value);
  }
  // delete spesific color
  const styles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        display: "inline-block",
        borderRadius: "2px",
        background: `${colorTextHex}`,
        position: "relative",
        marginRight: "10px",
        top: "3px",
      },
      colorSpanElement: {
        marginRight: "6px",
      },
      colorBody: {
        width: "36px",
        height: "14px",
        display: "inline-block",
        borderRadius: "2px",
        background: `${colorBodyHex}`,
        position: "relative",
        top: "3px",
      },
      swatch: {
        padding: "4px 8px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
        lineHeight: "25px",
      },
      popover: {
        position: "absolute",
        top: "115px",
        zIndex: "2",
      },
      popoverSecond: {
        position: "absolute",
        top: "115px",
        zIndex: "2",
        marginLeft: "15vw",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });
  // delete
  const handleClick = type => {
    setDisplayColorPicker(type);
  };
  // delete
  const handleClose = () => {
    setDisplayColorPicker(0);
  };
  // delete
  const handleColorChange = useCallback(
    (color, type, successMessage) => {
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
        updateColors("colorBody", color.hex, { successMessage });
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
        updateColors("colorText", color.hex, { successMessage });
        let updates = { color_2: color.hex };
        props.onChange(extend(report.clone(), updates));
        setColorElements(color.hex, false, false); 
      }
    },
    [report, props.onChange, updateColors]
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

  const handleDataSourceChange = useCallback(
    async (data_source_id, signal) => {
      changeModelDataText(modelSelectElement.current.props.placeholder);
      setLoadModelsLoaded(false);
      var newModels = [];
      try {
        const res = await Model.query({ data_source: data_source_id });
        newModels = res.results;
        if (signal && signal.aborted) return;
        const updates = {
          data_source_id,
          isJustLanded: false,
        }
        setModels(newModels);
        props.onChange(extend(report.clone(), { ...updates }));
        updateReport(updates, { successMessage: null });
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

  const handleModelChange = useCallback(
    async (modelId, signal) => {
      try {
        var res;
        if (report.isJustLanded) {
          res = { appSettings: report.appSettings, timekeeper: {} };
        } else {
          res = await Model.getReporterConfig(modelId);
        }
        const model = models.find(m => m.id === modelId);
        if (model && model.id !== report.model_id) {
          replaceHash(model, window.location.hash.split("/4/")[1]);
        }
        recordEvent("update", "report", report.id, { modelId });
        var updates = {
          model_id: modelId,
          appSettings: res.appSettings,
          timekeeper: res.timekeeper,
          isJustLanded: false,
        };
        if (report.data_source_id || selectedDataSource) {
          updates.data_source_id = report.data_source_id || selectedDataSource
        }
        if (signal && signal.aborted) return;
        props.onChange(extend(report.clone(), { ...updates }));
        updateReport({...report.clone(), ...updates}, { successMessage: null }); // show message only on error
        handleReportChanged(true);
        setSelectedModel(modelId);
      } catch (err) {
        updateReport({}, { successMessage: "failed to load the model" }); // show message only on error
      }
    },
    [report, props.onChange, updateReport]
  );

  const handleIdChange = useCallback(async id => {
    recordEvent("update", "report", report.id, { id });
    setReport(extend(report.clone(), { id }));
    updateReport({ id }, { successMessage: null });
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
    } catch {console.warn("price modal doesnt exist on this page.")}
  }

  const handleDeleteReport = () => {
    const report = props.report;
    if (report.id) {
      recordEvent("delete", "report", report.id, { name: report.name });
      deleteReport(report);
    } else {
      setReport(null);
    }
  }

  const handleSaveReport = (save_as) => {
    if (window.location.hash.substring(window.location.hash.indexOf("4/") + 2)) {
      updateReport({
        expression: window.location.hash.substring(window.location.hash.indexOf("4/") + 2),
        color_1: colorBodyHex || report.color_1,
        color_2: colorTextHex || report.color_2,
        name: save_as ? newName : reportName,
      }, { successMessage: "Report updated" });
      recordEvent("update", "report", report.id);
    } else {
      updateReport({
        color_1: colorBodyHex || report.color_1,
        color_2: colorTextHex || report.color_2,
        is_draft: false,
        name: reportName
      }, { successMessage: null });
      recordEvent("create", "report", report.id);
    }
    if (!report.id) {
      saveReport();
    }
  }

  const moreActionsMenu = useMemo(
    () =>
      createMenu([
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
    updateReport(report, { successMessage: null });
  }, [report.expression, window.location.hash]);

  useEffect(() => {
    if (report.isJustLanded) {
      if (colorTextHex !== report.color_2) handleColorChange(report.color_2, 1, null);
      if (colorBodyHex !== report.color_1) handleColorChange(report.color_1, 2, null);
      if (report.data_source_id !== selectedDataSource) handleDataSourceChange(report.data_source_id);
      if (report.model_id !== selectedModel) handleModelChange(report.model_id);
      if (report.name !== reportName) setReportName(report.name);
      if (report.id !== props.report.id) handleIdChange(report.id);
      setPriceButton(
        Number(localStorage.getItem(`${window.location.pathname}-price`)), 
        Number(localStorage.getItem(`${window.location.pathname}-proceed_data`)), 
        false);
      setTimeout(() => {
        handleReportChanged(false);
      }, 333);
    }
  }, [report.name]);
  
  useEffect(() => {
    if (window.location.href.indexOf("4/") > -1) {
      setCurrentHash(window.location.hash);
    }
  }, []);

  useEffect(() => {
    if (!currentHash) return;
    if (!dataSources) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    const setData = async (dataSourceId, model_id) => {
      if (signal.aborted) return;
      await handleDataSourceChange(dataSourceId, signal);
      if (signal.aborted) return;
      await handleModelChange(model_id, signal)
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
    if (dataSourcesLoaded && !selectedDataSource) {
      if (dataSources.length) {
        handleDataSourceChange(dataSources[0].id);
      }
    }
  }, [dataSourcesLoaded]);

  useEffect(() => {
    if (modelsLoaded && !selectedModel) {
      if (models.length) {
        handleModelChange(models[0].id);
        replaceHash(models[0], window.location.hash.split("/4/")[1]);
      }
    }
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
        <Button style={styles.swatch} className="m-r-5" onClick={() => handleClick(1)}>
          <span style={styles.colorSpanElement}>Text</span>
          <div style={styles.color} />
        </Button>
        <Button style={styles.swatch} className="m-r-5" onClick={() => handleClick(2)}>
          <span style={styles.colorSpanElement}>Chart</span>
          <div style={styles.colorBody} />
        </Button>
        {displayColorPicker === 1 ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={handleClose} />
            <SketchPicker color={colorTextHex} onChangeComplete={color => handleColorChange(color, 1)} />
          </div>
        ) : null}
        {displayColorPicker === 2 ? (
          <div style={styles.popoverSecond}>
            <div style={styles.cover} onClick={handleClose} />
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
          <Button className="m-r-5" onClick={handleDeleteReport}>
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
