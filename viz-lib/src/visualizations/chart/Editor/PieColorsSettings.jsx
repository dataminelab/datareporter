import { each, map } from "lodash";
import React, { useMemo, useCallback } from "react";
import Table from "antd/lib/table";
import ColorPicker from "@/components/ColorPicker";
import { EditorPropTypes } from "@/visualizations/prop-types";
import { AllColorPalettes } from "@/visualizations/ColorPalette";
import getChartData from "../getChartData";
import { Section, Select } from "@/components/visualizations/editor";

function getUniqueValues(chartData) {
  const uniqueValuesNames = new Set();
  each(chartData, series => {
    each(series.data, row => {
      uniqueValuesNames.add(row.x);
    });
  });
  return [...uniqueValuesNames];
}

export default function PieColorsSettings({ options, data, onOptionsChange }) {
  const colors = useMemo(
    () => ({
      Automatic: null,
      ...AllColorPalettes[options.color_scheme],
    }),
    [options.color_scheme]
  );

  const series = useMemo(
    () =>
      map(getUniqueValues(getChartData(data.rows, options)), value => ({
        key: value,
        color: (options.valuesOptions[value] || {}).color || null,
      })),
    [options, data]
  );

  const updateValuesOption = useCallback(
    (key, prop, value) => {
      onOptionsChange({
        valuesOptions: {
          [key]: {
            [prop]: value,
          },
        },
      });
    },
    [onOptionsChange]
  );

  const columns = [
    {
      title: "Values",
      dataIndex: "key",
    },
    {
      title: "Color",
      dataIndex: "color",
      width: "1%",
      render: (unused, item) => (
        <ColorPicker
          data-test={`Chart.Series.${item.key}.Color`}
          interactive
          presetColors={colors}
          placement="topRight"
          color={item.color}
          onChange={(value) => updateValuesOption(item.key, "color", value)}
          addonAfter={<ColorPicker.Label color={item.color} presetColors={colors} />}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <Section>
          <Select
            label="Color Scheme"
            defaultValue={options.color_scheme}
            data-test="ColorScheme"
            onChange={(val ) => onOptionsChange({ color_scheme: val })}>
            {Object.keys(AllColorPalettes).map(option => (
             <Select.Option data-test={`ColorOption${option}`} key={option} value={option}>{option}</Select.Option>
            ))}
          </Select>
        </Section>
      <Table showHeader={false} dataSource={series} columns={columns} pagination={false} />
    </React.Fragment>
  )
}

PieColorsSettings.propTypes = EditorPropTypes;
