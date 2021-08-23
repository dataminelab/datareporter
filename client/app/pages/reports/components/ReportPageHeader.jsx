import {extend, map, filter, reduce, find, includes} from "lodash";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import useMedia from "use-media";
import EditInPlace from "@/components/EditInPlace";
import FavoritesControl from "@/components/FavoritesControl";
import { ReportTagsControl } from "@/components/tags-control/TagsControl";
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'
import getTags from "@/services/getTags";
import { clientConfig } from "@/services/auth";
import useReportFlags from "../hooks/useReportFlags";
import useArchiveReport from "../hooks/useArchiveReport";
import usePublishReport from "../hooks/usePublishReport";
import useUnpublishReport from "../hooks/useUnpublishReport";
import useUpdateReportTags from "../hooks/useUpdateReportTags";
import useRenameReport from "../hooks/useRenameReport";
import useDuplicateReport from "../hooks/useDuplicateReport";
import useApiKeyDialog from "../hooks/useApiKeyDialog";
import usePermissionsEditorDialog from "../hooks/usePermissionsEditorDialog";


import "./ReportPageHeader.less";
import Select from "antd/lib/select";
import useReportDataSources from "@/pages/reports/hooks/useReportDataSources";
import recordEvent from "@/services/recordEvent";
import useReport from "@/pages/reports/hooks/useReport";
import useUpdateReport from "@/pages/reports/hooks/useUpdateReport";
import Model from "@/services/model";
import DataSource from "@/services/data-source";

function getReportTags() {
  return getTags("api/query/tags").then(tags => map(tags, t => t.name));
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

function chooseDataSourceId(dataSourceIds, availableDataSources) {
  dataSourceIds = map(dataSourceIds, v => parseInt(v, 10));
  availableDataSources = map(availableDataSources, ds => ds.id);
  return find(dataSourceIds, id => includes(availableDataSources, id)) || null;
}

function chooseModelId(modelIds, availableModels) {
  modelIds = map(modelIds, v => parseInt(v, 10));
  availableModels = map(availableModels, ds => ds.id);
  return find(modelIds, id => includes(availableModels, id)) || null;
}

export default function ReportPageHeader(props) {
  const isDesktop = useMedia({ minWidth: 768 });
  const queryFlags = useReportFlags(props.report, props.dataSource);
  const updateName = useRenameReport(props.report, props.onChange);
  const updateTags = useUpdateReportTags(props.report, props.onChange);
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
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        marginRight: '10px',
        cursor: 'pointer',
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

  const handleChange = (color) => {
    if (displayColorPicker === 2) {
      setColorBody(color.rgb)
    } else {
      setColorText(color.rgb)
    }
  };

  const handleDataSourceChange = useCallback(
    async dataSourceId => {
      if (dataSourceId) {
        try {
          localStorage.setItem("lastSelectedDataSourceId", dataSourceId);
        } catch (e) {
          // `localStorage.setItem` may throw exception if there are no enough space - in this case it could be ignored
        }
      }
      if (report.data_source_id !== dataSourceId) {
        recordEvent("update_data_source", "report", report.id, { dataSourceId });
        const updates = {
          data_source_id: dataSourceId,
          latest_report_data_id: null,
          latest_report_data: null,
        };
        setReport(extend(report.clone(), updates));
        updateReport(updates, { successMessage: null }); // show message only on error
      }
    },
    [report, setReport, updateReport]
  );

  const onChangeDataSource = useCallback(async (id) => {
    setLoadModelsLoaded(true)
    try {
      const res = await Model.query({data_source: id});
      setModels(res.results);
      setLoadModelsLoaded(false);
    } catch(err) {
      //setError(err);
      setLoadModelsLoaded(false);
    }

  }, [models, modelsLoaded])

  const handleModelChange = useCallback(
    async modelId => {
      setLoadModelConfigLoaded(true)
      try {
        const res = await Model.getReporterConfig(modelId);
        setModelConfig(res);
        setLoadModelConfigLoaded(false);
        recordEvent("update_report_config", "report", report.id, { modelId });
        const updates = {
          model: modelId,
          appSettings: res.appSettings,
          timekeeper: res.timekeeper,
        };
        props.onChange(extend(report.clone(), updates));
        updateReport(updates, { successMessage: null }); // show message only on error
      } catch(err) {
        setLoadModelConfigLoaded(false);
      }
    },
    [report, props.onChange, updateReport]
  );

  useEffect(() => {
    // choose data source id for new reports
    if (dataSourcesLoaded && reportFlags.isNew) {
      const firstDataSourceId = dataSources.length > 0 ? dataSources[0].id : null;
      handleDataSourceChange(
        chooseDataSourceId(
          [report.data_source_id, localStorage.getItem("lastSelectedDataSourceId"), firstDataSourceId],
          dataSources
        )
      );
    }
  }, [
    report.data_source_id,
    report.model,
    reportFlags.isNew,
    dataSourcesLoaded,
    dataSources,
    handleDataSourceChange,
    handleModelChange]);

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

  return (
    <div className="report-page-header">
      <div className="title-with-tags m-l-5">
        <div className="page-title">
          <div className="d-flex align-items-center">
            {!queryFlags.isNew && <FavoritesControl item={report} />}
            <h3>
              <EditInPlace isEditable={queryFlags.canEdit} onDone={updateName} ignoreBlanks value={report.name} />
            </h3>
          </div>
        </div>
        <div className="report-tags">
          <ReportTagsControl
            tags={report.tags}
            isDraft={queryFlags.isDraft}
            isArchived={queryFlags.isArchived}
            canEdit={queryFlags.canEdit}
            getAvailableTags={getReportTags}
            onEdit={updateTags}
            tagsExtra={props.tagsExtra}
          />
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
        { displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ handleClose }/>
          <SketchPicker color={ colorBody } onChangeComplete={ (color, type) => handleChange(color, type) } />
          <button onClick={ handleClose }>Apply</button>
          <button onClick={ handleClose }>Cancel</button>
        </div> : null }
        {dataSourcesLoaded && (
          <div className="data-source-box m-r-5 ">
            <span className="icon icon-datasource m-r-5"></span>
            <Select
              data-test="SelectDataSource"
              placeholder="Choose data source..."
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
        <div className="data-source-box m-r-5 ">
          <span className="icon icon-datasource m-r-5"></span>
          <Select
            data-test="SelectModel"
            placeholder="Choose data source..."
            value={report.model}
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
        <Button className="m-r-5" onClick={() => saveReport(report)}>
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
