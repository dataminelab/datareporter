import { extend, map, filter, reduce } from "lodash";
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import useMedia from "use-media";
import EditInPlace from "@/components/EditInPlace";
import FavoritesControl from "@/components/FavoritesControl";
import reactCSS from "reactcss";
import { SketchPicker } from "react-color";
import { clientConfig } from "@/services/auth";
import useReportFlags from "../hooks/useReportFlags";
import useArchiveReport from "../hooks/useArchiveReport";
import usePublishReport from "../hooks/usePublishReport";
import useUnpublishReport from "../hooks/useUnpublishReport";
import useDuplicateReport from "../hooks/useDuplicateReport";
import useApiKeyDialog from "../hooks/useApiKeyDialog";
import usePermissionsEditorDialog from "../hooks/usePermissionsEditorDialog";
import useColorsReport from "@/pages/reports/hooks/useColorsReport";
import "./ReportPageHeader.less";
import Select from "antd/lib/select";
import useReportDataSources from "@/pages/reports/hooks/useReportDataSources";
import recordEvent from "@/services/recordEvent";
import useReport from "@/pages/reports/hooks/useReport";
import useUpdateReport from "@/pages/reports/hooks/useUpdateReport";
import Model from "@/services/model";

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
  const queryFlags = useReportFlags(props.report, props.dataSource);
  const archiveReport = useArchiveReport(props.report, props.onChange);
  const publishReport = usePublishReport(props.report, props.onChange);
  const unpublishReport = useUnpublishReport(props.report, props.onChange);
  const [isDuplicating, duplicateReport] = useDuplicateReport(props.report);
  const openApiKeyDialog = useApiKeyDialog(props.report, props.onChange);
  const openPermissionsEditorDialog = usePermissionsEditorDialog(props.report);
  const { dataSourcesLoaded, dataSources, dataSource } = useReportDataSources(props.report);
  const [models, setModels] = useState([]);
  const [modelsLoaded, setLoadModelsLoaded] = useState(false);
  const [modelConfig, setModelConfig] = useState({});
  const [modelConfigLoaded, setLoadModelConfigLoaded] = useState(false);
  const reportFlags = useReportFlags(props.report, dataSource);
  const [currentHash, setCurrentHash] = useState(null);
  const { report, setReport, saveReport } = useReport(props.report);
  const updateColors = useColorsReport(report, props.onChange);
  const updateReport = useUpdateReport(report, setReport);
  const [displayColorPicker, setDisplayColorPicker] = useState(null);
  const modelSelectElement = useRef();
  const modelSelectElementText = useRef("");
  const [colorBodyHex, setColorBodyHex] = useState("#f17013");
  const [colorTextHex, setColorTextHex] = useState("#f17013");
  
  const [colorBody, setColorBody] = useState({
    r: "241",
    g: "112",
    b: "19",
    a: "1",
  });
  const [colorText, setColorText] = useState({
    r: "241",
    g: "112",
    b: "19",
    a: "1",
  });

  const styles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        display: "inline-block",
        borderRadius: "2px",
        background: `rgba(${colorText.r}, ${colorText.g}, ${colorText.b}, ${colorText.a})`,
        position: "relative",
        marginRight: "10px",
        top: "3px",
      },
      colorBody: {
        width: "36px",
        height: "14px",
        display: "inline-block",
        borderRadius: "2px",
        background: `rgba(${colorBody.r}, ${colorBody.g}, ${colorBody.b}, ${colorBody.a})`,
        position: "relative",
        top: "3px",
      },
      swatch: {
        padding: "5px 15px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        marginRight: "10px",
        cursor: "pointer",
        lineHeight: "25px",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
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

  const restartHash = (table, hash) => {
    window.location.hash = "#" + table + "/4/" + hash;
    return window.location.reload()
  }

  const handleClick = type => {
    setDisplayColorPicker(type);
  };

  const handleClose = () => {
    setDisplayColorPicker(0);
  };

  const hexToRgb = hex => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : null;
  };

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
        setColorBody(color.rgb);
        setColorBodyHex(color.hex);
        updateColors("colorBody", color.hex, { successMessage:null });
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
        setColorText(color.rgb);
        setColorTextHex(color.hex);
        updateColors("colorText", color.hex, { successMessage:null });
        let updates = { color_2: color.hex };
        props.onChange(extend(report.clone(), updates));
        setColorElements(color.hex, false, false);     
      }
    },
    [report, updateColors]
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
    async (dataSourceId, signal) => {
      changeModelDataText(modelSelectElement.current.props.placeholder);
      setLoadModelsLoaded(true);
      recordEvent("update", "report", report.id, { dataSourceId });
      try {
        const res = await Model.query({ data_source: dataSourceId });
        if (signal && signal.aborted) return;
        const updates = {
          data_source_id: dataSourceId,
          isJustLanded: false,
        }
        setModels(res.results);
        props.onChange(extend(report.clone(), { ...updates }));
        updateReport(updates, { successMessage: null });
        setLoadModelsLoaded(false);
      } catch (err) {
        updateReport({}, { successMessage: err });
        setLoadModelsLoaded(false);
      }
    },
    [report, props.onChange, updateReport]
  );

  const handleModelOnSelect = () => changeModelDataText(modelSelectElementText.current);

  const handleModelChange = useCallback(
    async (modelId, data_source_id) => {
      setLoadModelConfigLoaded(true);
      try {
        var res;
        if (report.isJustLanded) {
          res = { appSettings: report.appSettings, timekeeper: {} };
        } else {
          res = await Model.getReporterConfig(modelId);
        }
        if (report.model) {
          // get model name from model id
          const model = models.find(m => m.id === modelId);
          if (model && model.id !== report.model) {
            return restartHash(model.table, window.location.hash.split("/4/")[1]);
          }
        }
        setModelConfig(res);
        recordEvent("update", "report", report.id, { modelId });
        var updates = {
          // fix below line only one model id is enough
          model: modelId,
          model_id: modelId,
          appSettings: res.appSettings,
          timekeeper: res.timekeeper,
          isJustLanded: false,
        };
        if (typeof data_source_id == "number") {
          updates.data_source_id = data_source_id;
        }
        props.onChange(extend(report.clone(), { ...updates }));
        updateReport(updates, { successMessage: null }); // show message only on error
        setLoadModelConfigLoaded(false);
      } catch (err) {
        updateReport({}, { successMessage: "failed to load the model" }); // show message only on error
        setLoadModelConfigLoaded(false);
      }
    },
    [report, props.onChange, updateReport]
  );

  const handleIdChange = useCallback(async id => {
    recordEvent("update", "report", report.id, { id });
    props.onChange(extend(report.clone(), { id }));
    updateReport({ id }, { successMessage: null });
  });

  const handleUpdateName = useCallback(
    name => {
      recordEvent("update", "report", report.id, { name });
      const changes = { name };
      const options = {};

      if (report.is_draft && clientConfig.autoPublishNamedQueries && name !== "New Report") {
        changes.is_draft = false;
        options.successMessage = "Report saved and published";
      }
      props.onChange(extend(report.clone(), changes));
      updateReport(changes, { successMessage: null });
    },
    [report.id, report.is_draft, updateReport]
  );

  const handlePriceReport = () => {
    try {
      if (document.querySelector("#meta-modal").style.opacity === "1") {
        document.querySelector("#meta-modal").style.opacity = "0";
        document.querySelector("#meta-modal").style["z-index"] = "-1";
      } else {
        document.querySelector("#meta-modal").style.opacity = "1";
        document.querySelector("#meta-modal").style["z-index"] = "10";
      }
    } catch {console.warn("price modal doesnt exist on this page.")}
  };

  const handleSaveReport = () => {
    if (!window.location.hash.substring(window.location.hash.indexOf("4/") + 2)) {
      recordEvent("create", report.id, { id: report.id });
      updateReport({
        color_1: colorBodyHex || report.color_1,
        color_2: colorTextHex || report.color_2,
        is_draft: false
      }, { successMessage: null });
      return saveReport();
    }
    updateReport({
      expression: window.location.hash.substring(window.location.hash.indexOf("4/") + 2),
      color_1: colorBodyHex || report.color_1,
      color_2: colorTextHex || report.color_2
    }, { successMessage: null });
    if (!report.expression || !report.appSettings) {
      setTimeout(() => {
        document.querySelector("#_handleSaveReport").click();
      }, 466);
      return 0;
    }
    return saveReport();
  };

  const moreActionsMenu = useMemo(
    () =>
      createMenu([
        {
          fork: {
            isEnabled: !queryFlags.isNew && queryFlags.canFork && !isDuplicating,
            title: (
              <React.Fragment>
                Fork
                <i className="fa fa-external-link m-l-5" />
              </React.Fragment>
            ),
            onClick: duplicateReport,
          },
        },
        {
          archive: {
            isAvailable: !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isArchived,
            title: "Archive",
            onClick: archiveReport,
          },
          displayRawData: {
            isAvailable: true,
            title: "Display raw data",
            onClick: () => {document.querySelector("#raw-data-button").click()},
          },
          downloadCSV: {
            isAvailable: true,
            title: "Download as CSV",
            onClick: () => {document.querySelector("#export-data-csv").click()},
          },
          downloadTSV: {
            isAvailable: true,
            title: "Download as TSV",
            onClick: () => {document.querySelector("#export-data-tsv").click()},
          },
          managePermissions: {
            isAvailable:
              !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isArchived && clientConfig.showPermissionsControl,
            title: "Manage Permissions",
            onClick: openPermissionsEditorDialog,
          },
          publish: {
            isAvailable:
              !isDesktop && queryFlags.isDraft && !queryFlags.isArchived && !queryFlags.isNew && queryFlags.canEdit,
            title: "Publish",
            onClick: publishReport,
          },
          unpublish: {
            isAvailable: !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isDraft,
            title: "Unpublish",
            onClick: unpublishReport,
          },
        },
        {
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
    if (report.isJustLanded) {
      handleColorChange(report.color_1, 2, null);
      handleColorChange(report.color_2, 1, null);
      handleDataSourceChange(report.data_source_id);
      handleModelChange(report.model_id);
      handleIdChange(report.id);
    }
  }, [report.name]);

  useEffect(() => {
    // copy-pasted url landing
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
      await handleModelChange(model_id, parseInt(dataSourceId), signal)
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
  return (
    <div className="report-page-header">
      <div className="title-with-tags m-l-5">
        <div className="page-title">
          <div className="d-flex align-items-center">
            {!queryFlags.isNew && <FavoritesControl item={report} />}
            <h3>
              <EditInPlace isEditable={queryFlags.canEdit} onDone={handleUpdateName} ignoreBlanks value={report.name} />
            </h3>
          </div>
        </div>
      </div>
      <div className="header-actions">
        {props.headerExtra}
        <div>
          <Button className="ant-menu-submenu-title m-r-5" id="meta-button" onClick={handlePriceReport}>
            <span className="icon icon-ribbon m-r-5"></span>Meta
          </Button>
          <ul
            id="meta-modal"
            className="ant-menu ant-menu-sub ant-menu-hidden ant-menu-vertical"
            role="menu"
            onClick={e => e.stopPropagation()}>
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
        <div style={styles.swatch} onClick={() => handleClick(1)}>
          Text chart color: <div style={styles.color} />
        </div>
        <div style={styles.swatch} onClick={() => handleClick(2)}>
          Chart color: <div style={styles.colorBody} />
        </div>
        {displayColorPicker === 1 ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={handleClose} />
            <SketchPicker color={colorText} onChangeComplete={color => handleColorChange(color, 1)} />
            <button style={{ margin: "10px" }} onClick={handleClose}>
              Close
            </button>
          </div>
        ) : null}
        {displayColorPicker === 2 ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={handleClose} />
            <SketchPicker color={colorBody} onChangeComplete={color => handleColorChange(color, 2)} />
            <button style={{ margin: "10px" }} onClick={handleClose}>
              Close
            </button>
          </div>
        ) : null}
        {dataSourcesLoaded && (
          <div className="data-source-box m-r-10">
            <span className="icon icon-datasource m-r-5"></span>
            <Select
              data-test="SelectDataSource"
              placeholder="Choose base data source..."
              value={report ? report.data_source_id : undefined}
              disabled={!reportFlags.canEdit || !dataSourcesLoaded || dataSources.length === 0}
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
        )}
        <div className="data-source-box m-r-10">
          <span className="icon icon-datasource m-r-5"></span>
          <Select
            data-test="SelectModel"
            placeholder="Choose model data source..."
            id="model-data-source"
            ref={modelSelectElement}
            value={report.model_id}
            disabled={!reportFlags.canEdit || modelsLoaded || models.length === 0}
            loading={modelsLoaded}
            optionFilterProp="data-name"
            showSearch
            onSelect={handleModelOnSelect}
            onChange={handleModelChange}>
            {map(models, m => (
              <Select.Option key={`ds-${m.id}`} value={m.id} data-name={m.name} data-test={`SelectModel${m.id}`}>
                <span>{m.name}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
        <Button className="m-r-5" id="_handleSaveReport" onClick={handleSaveReport}>
          <span className="icon icon-save-floppy-disc m-r-5"></span> Save Report
        </Button>
        {isDesktop && queryFlags.isDraft && !queryFlags.isArchived && !queryFlags.isNew && queryFlags.canEdit && (
          <Button className="m-r-5" onClick={publishReport}>
            <i className="fa fa-paper-plane m-r-5" /> Publish
          </Button>
        )}

        {!queryFlags.isNew && queryFlags.canViewSource && (
          <span>
            {!props.sourceMode && (
              <Button className="m-r-5" href={report.getUrl(true, props.selectedVisualization)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true" />
                <span className="m-l-5">Edit Source</span>
              </Button>
            )}
          </span>
        )}

        {!queryFlags.isNew && (
          <Dropdown overlay={moreActionsMenu} trigger={["click"]}>
            <Button>
              <Icon type="ellipsis" rotate={90} />
            </Button>
          </Dropdown>
        )}
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
};

ReportPageHeader.defaultProps = {
  dataSource: null,
  sourceMode: false,
  selectedVisualization: null,
  headerExtra: null,
  tagsExtra: null,
  onChangeColor: () => {},
};
