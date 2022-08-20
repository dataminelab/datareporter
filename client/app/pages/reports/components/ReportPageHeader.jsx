import {extend, map, filter, reduce} from "lodash";
import React, {useCallback, useMemo, useState, useEffect} from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import useMedia from "use-media";
import EditInPlace from "@/components/EditInPlace";
import FavoritesControl from "@/components/FavoritesControl";
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'
import { clientConfig } from "@/services/auth";
import useReportFlags from "../hooks/useReportFlags";
import useArchiveReport from "../hooks/useArchiveReport";
import usePublishReport from "../hooks/usePublishReport";
import useUnpublishReport from "../hooks/useUnpublishReport";
//import useUpdateReportTags from "../hooks/useUpdateReportTags";
//import useRenameReport from "../hooks/useRenameReport";
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
  const reportFlags = useReportFlags(props.report, dataSource)

  const { report, setReport, saveReport } = useReport(props.report);
  const updateColors = useColorsReport(report, props.onChange);
  const updateReport = useUpdateReport(report, setReport);
  const [displayColorPicker, setDisplayColorPicker] = useState(null);
  const [colorBody, setColorBody] = useState(
    {
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    }
  );
  const [colorText, setColorText] = useState({
    r: '241',
    g: '112',
    b: '19',
    a: '1',
  });

  const styles = reactCSS({
    'default': {
      color: {
        width: '36px',
        height: '14px',
        display: 'inline-block',
        borderRadius: '2px',
        background: `rgba(${ colorText.r }, ${ colorText.g }, ${ colorText.b }, ${ colorText.a })`,
        position: 'relative',
        marginRight: '10px',
        top: '3px',
      },
      colorBody: {
        width: '36px',
        height: '14px',
        display: 'inline-block',
        borderRadius: '2px',
        background: `rgba(${ colorBody.r }, ${ colorBody.g }, ${ colorBody.b }, ${ colorBody.a })`,
        position: 'relative',
        top: '3px',
      },
      swatch: {
        padding: '5px 15px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        marginRight: '10px',
        cursor: 'pointer',
        lineHeight: '25px'
      },
      popover: {
        position: 'absolute',
        zIndex: '2',
      },
      cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    },
  });

  const handleClick = (type) => {
    setDisplayColorPicker(type)
  };

  const handleClose = () => {
    setDisplayColorPicker(0)
  };

  const hexToRgb = (hex) => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1
    } : null;
  }

  const handleColorChange = useCallback(
    (color, type) => {
      if (!color.rgb && color.startsWith("#")) {
        color = {
          rgb: hexToRgb(color),
          hex: color,
        }
      }
      if (!color.rgb || !color.hex) {
        return 0
      }
      if (type === 2) {
        setColorBody(color.rgb)
        updateColors('colorBody', color.hex);
        let updates = { color_1: color.hex }
        props.onChange(extend(report.clone(), updates));
        updateReport(updates, { successMessage: null });
      } else {
        setColorText(color.rgb)
        updateColors('colorText', color.hex);
        let updates = { color_2: color.hex }
        props.onChange(extend(report.clone(), updates));
        updateReport(updates, { successMessage: null });
      }
    },[report, updateColors]
  );

  const onChangeDataSource = useCallback( async dataSourceId => {
    setLoadModelsLoaded(true)
    try {
        const res = await Model.query({data_source: dataSourceId});
        recordEvent("set_report:dataSourceId", "report", report.id, { dataSourceId });
        const updates = {
          data_source_id: dataSourceId,
          isJustLanded: false,
          // latest_report_data_id: null,
          // latest_report_data: null,
        };
        setModels(res.results);
        props.onChange(extend(report.clone(), updates));
        recordEvent("update_report_config:dataSourceId", "report", report.id, { dataSourceId });
        updateReport(updates, { successMessage: null });
        setLoadModelsLoaded(false);
    } catch(err) {
        console.error("*ERR",err);
        setLoadModelsLoaded(false);
    }

  }, [report, props.onChange, updateReport])

  const handleModelChange = useCallback( async modelId => {
      setLoadModelConfigLoaded(true)
      try {
        var res
        if (report.isJustLanded) {
          res = {appSettings: report.appSettings, timekeeper:{}}
        } else {
          res = await Model.getReporterConfig(modelId);
        }
        setModelConfig(res);
        recordEvent("update_report_config:modelId", "report", report.id, { modelId });
        const updates = {
          model: modelId,
          model_id: modelId,
          appSettings: res.appSettings,
          timekeeper: res.timekeeper,
          isJustLanded: false,
        };
        props.onChange(extend(report.clone(), updates));
        updateReport(updates, { successMessage: null }); // show message only on error
        setLoadModelConfigLoaded(false);
      } catch(err) {
        setLoadModelConfigLoaded(false);
      }
    }, [report, props.onChange, updateReport]
  );

  const handleUpdateName = useCallback(
    name => {
      recordEvent("edit_name", "report", report.id);
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

  const handleSaveReport = () => {
    let updates = {
      expression: window.location.hash.substring(window.location.hash.indexOf("4/") + 2),
      color_1: report.color_1 || "#f17013",
      color_2: report.color_2 || "#f17013",
    };
    props.onChange(extend(report.clone(), updates));
    updateReport(updates, { successMessage: null });
    if (!report.expression) {
      setTimeout(()=>{
        // need to render itself again with recent changes
        console.log("clicking lol")
        document.querySelector("#_handleSaveReport").click();
      }, 4333);
      return 0;
    }
    return saveReport(report);
  }


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
      handleColorChange(report.color_1, 2);
      handleColorChange(report.color_2, 1);
      onChangeDataSource(report.data_source_id);
      handleModelChange(report.model_id);
    }
  }, [report.name]);

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
        <div style={ styles.swatch } onClick={ () => handleClick(1) }>
          Text chart color: <div style={ styles.color } />
        </div>
        <div style={ styles.swatch } onClick={ () => handleClick(2) }>
          Chart color: <div style={ styles.colorBody } />
        </div>
        { displayColorPicker === 1 ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ handleClose }/>
          <SketchPicker color={ colorText } onChangeComplete={ (color) => handleColorChange(color, 1) } />
          <button style={{ margin: "10px" }} onClick={ handleClose }>Close</button>
        </div> : null }
        { displayColorPicker === 2 ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ handleClose }/>
          <SketchPicker color={ colorBody } onChangeComplete={ (color) => handleColorChange(color, 2) } />
          <button style={{ margin: "10px" }} onClick={ handleClose }>Close</button>
        </div> : null }
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
              onChange={onChangeDataSource}>
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
            value={report.model_id}
            disabled={!reportFlags.canEdit || modelsLoaded || models.length === 0}
            loading={modelsLoaded}
            optionFilterProp="data-name"
            showSearch
            onChange={handleModelChange}>
            {map(models, m => (
              <Select.Option
                key={`ds-${m.id}`}
                value={m.id}
                data-name={m.name}
                data-test={`SelectModel${m.id}`}>
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
            {props.sourceMode && (
              <Button
                className="m-r-5"
                href={report.getUrl(false, props.selectedVisualization)}
                data-test="ReportPageShowDataOnly">
                <i className="fa fa-table" aria-hidden="true" />
                <span className="m-l-5">Show Data Only</span>
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
    id: PropTypes.string,
    name: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  dataSource: PropTypes.array,
  sourceMode: PropTypes.bool,
  selectedVisualization: PropTypes.number,
  headerExtra: PropTypes.node,
  tagsExtra: PropTypes.node,
  onChangeColor: PropTypes.func
};

ReportPageHeader.defaultProps = {
  dataSource: null,
  sourceMode: false,
  selectedVisualization: null,
  headerExtra: null,
  tagsExtra: null,
  onChangeColor: () => {}
};
