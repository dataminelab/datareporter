import React, { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { map, extend } from "lodash";
import Select from "antd/lib/select";
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import FolderOutlinedIcon from "@ant-design/icons/FolderOutlined";
import FileOutlinedIcon from "@ant-design/icons/FileOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";

export default function DataSourceModelSelector({
  report,
  dataSources,
  dataSourcesLoaded,
  reportFlags,
  models,
  modelsLoaded,
  selectedModel,
  setSelectedModel,
  selectedDataSource,
  handleDataSourceChange,
  getDataSource,
  onChange,
  handleReportChanged,
  handleModelChange,
}) {
  const modelSelectElement = useRef();
  const modelInputRef = useRef();

  const handleJsonModelChange = useCallback(
    e => {
      const value = e.target.value;
      const updates = { model_id: value };
      onChange(extend(report.clone(), updates));
      setSelectedModel(value);
      handleReportChanged(true);
    },
    [onChange, report, handleReportChanged, setSelectedModel],
  );

  const handleArrowClick = useCallback(() => {
    const currentModel = selectedModel || report.model_id;
    if (currentModel) {
      handleModelChange(currentModel);
    }
  }, [selectedModel, report.model_id, handleModelChange]);

  const renderModelSelect = () => {
    const dataSource = getDataSource(report.data_source_id);
    if (!dataSource) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Select
            data-test="SelectModel"
            placeholder="Choose model data source..."
            disabled
            optionFilterProp="data-name"
            showSearch
            ref={modelSelectElement}
            style={{ flex: 1 }}
          >
            <Select.Option
              key={`no-ds`}
              value={undefined}
              data-name={`No Data Source`}
              data-test={`SelectModelNoDataSource`}
            >
              <span>No Data Source</span>
            </Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={handleArrowClick}
            disabled={!selectedModel && !report.model_id}
            style={{ marginLeft: 8 }}
            data-test="LoadModelButton"
          />
        </div>
      );
    }

    if (dataSource.name === "json") {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            ref={modelInputRef}
            data-test="InputModel"
            placeholder="Enter JSON model..."
            value={selectedModel}
            onChange={handleJsonModelChange}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={handleArrowClick}
            disabled={!selectedModel}
            style={{ marginLeft: 8 }}
            data-test="LoadModelButton"
          />
        </div>
      );
    }

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Select
          data-test="SelectModel"
          placeholder="Choose model data source..."
          value={report ? report.model_id : undefined}
          disabled={
            report.id ||
            !reportFlags.canEdit ||
            !modelsLoaded ||
            models.length === 0
          }
          loading={!modelsLoaded}
          optionFilterProp="data-name"
          showSearch
          ref={modelSelectElement}
          onChange={handleModelChange}
          style={{ flex: 1 }}
        >
          {map(models, m => (
            <Select.Option
              key={`ds-${m.id}`}
              value={m.id}
              data-name={m.name}
              data-test={`SelectModel${m.id}`}
            >
              <span>{m.name}</span>
            </Select.Option>
          ))}
        </Select>
        <Button
          type="primary"
          icon={<RightOutlined />}
          onClick={handleArrowClick}
          disabled={!report.model_id}
          style={{ marginLeft: 8 }}
          data-test="LoadModelButton"
        />
      </div>
    );
  };

  return (
    <>
      <div className="data-source-box m-r-5">
        <FolderOutlinedIcon />
        <Select
          data-test="SelectDataSource"
          placeholder="Choose base data source..."
          value={selectedDataSource}
          disabled={
            !reportFlags.canEdit ||
            !dataSourcesLoaded ||
            dataSources.length === 0
          }
          loading={!dataSourcesLoaded}
          optionFilterProp="data-name"
          showSearch
          onChange={handleDataSourceChange}
        >
          {map(dataSources, ds => (
            <Select.Option
              key={`ds-${ds.id}`}
              value={ds.id}
              data-name={ds.name}
              data-test={`SelectDataSource${ds.id}`}
            >
              <img
                src={`/static/images/db-logos/${ds.type}.png`}
                width="20"
                alt={ds.name}
              />
              <span>{ds.name}</span>
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="data-source-box m-r-5" id="model-data-source">
        <FileOutlinedIcon />
        {renderModelSelect()}
      </div>
    </>
  );
}

DataSourceModelSelector.propTypes = {
  report: PropTypes.object.isRequired,
  dataSources: PropTypes.array.isRequired,
  dataSourcesLoaded: PropTypes.bool.isRequired,
  reportFlags: PropTypes.object.isRequired,
  models: PropTypes.array.isRequired,
  modelsLoaded: PropTypes.bool.isRequired,
  selectedModel: PropTypes.any,
  setSelectedModel: PropTypes.func.isRequired,
  selectedDataSource: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  updateReport: PropTypes.func.isRequired,
  handleReportChanged: PropTypes.func.isRequired,
  getModel: PropTypes.func.isRequired,
  getDataSource: PropTypes.func.isRequired,
  getSettings: PropTypes.func.isRequired,
  getModelDataCube: PropTypes.func.isRequired,
  handleDataSourceChange: PropTypes.func.isRequired,
};
