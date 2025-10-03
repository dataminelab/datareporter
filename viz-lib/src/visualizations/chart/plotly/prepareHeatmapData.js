import { map, max, uniq, sortBy, flatten, find, findIndex } from "lodash";
import { createNumberFormatter } from "@/lib/value-format";
import Colorscale from "plotly.js/src/components/colorscale";
import * as d3 from "d3";
import chooseTextColorForBackground from "@/lib/chooseTextColorForBackground";

const defaultColorScheme = [
  [0, "#356aff"],
  [0.14, "#4a7aff"],
  [0.28, "#5d87ff"],
  [0.42, "#7398ff"],
  [0.56, "#fb8c8c"],
  [0.71, "#ec6463"],
  [0.86, "#ec4949"],
  [1, "#e92827"],
];

function getColor(value, scheme) {
  if (value == 1) { return scheme[scheme.length - 1][1]; }
  const upperboundIndex = findIndex(scheme, (range) => value < range[0]);
  const scale = d3.interpolate(scheme[upperboundIndex - 1][1], scheme[upperboundIndex][1]);
  return scale(value);
}

function prepareSeries(series, options, additionalOptions) {
  const { colorScheme, formatNumber } = additionalOptions;

  const plotlySeries = {
    x: [],
    y: [],
    z: [],
    type: "heatmap",
    name: "",
    colorscale: colorScheme,
  };

  plotlySeries.x = uniq(map(series.data, v => v.x));
  plotlySeries.y = uniq(map(series.data, v => v.y));

  if (options.sortX) {
    plotlySeries.x = sortBy(plotlySeries.x);
  }

  if (options.sortY) {
    plotlySeries.y = sortBy(plotlySeries.y);
  }

  if (options.reverseX) {
    plotlySeries.x.reverse();
  }

  if (options.reverseY) {
    plotlySeries.y.reverse();
  }

  const zMax = max(map(series.data, d => d.zVal));

  // Use text trace instead of default annotation for better performance
  const dataLabels = {
    x: [],
    y: [],
    mode: "text",
    hoverinfo: "skip",
    showlegend: false,
    text: [],
    textfont: {
      color: [],
    },
  };

  for (let i = 0; i < plotlySeries.y.length; i += 1) {
    const item = [];
    for (let j = 0; j < plotlySeries.x.length; j += 1) {
      const datum = find(series.data, { x: plotlySeries.x[j], y: plotlySeries.y[i] });

      const zValue = (datum && datum.zVal) || 0;
      item.push(zValue);

      if (isFinite(zMax) && options.showDataLabels) {
        dataLabels.x.push(plotlySeries.x[j]);
        dataLabels.y.push(plotlySeries.y[i]);
        dataLabels.text.push(formatNumber(zValue));
        if (options.colorScheme) {
          const bgcolor = getColor(zValue / zMax, colorScheme);
          const fgcolor = chooseTextColorForBackground(bgcolor);
          dataLabels.textfont.color.push(fgcolor);
        }
      }
    }
    plotlySeries.z.push(item);
  }

  if (isFinite(zMax) && options.showDataLabels) {
    return [plotlySeries, dataLabels];
  }
  return [plotlySeries];
}

export default function prepareHeatmapData(seriesList, options) {
  let colorScheme = [];

  if (!options.colorScheme) {
    colorScheme = defaultColorScheme;
  } else if (options.colorScheme === "Custom...") {
    colorScheme = [
      [0, options.heatMinColor],
      [1, options.heatMaxColor],
    ];
  } else {
    colorScheme = Colorscale.getScale(options.colorScheme);
  }

  const additionalOptions = {
    colorScheme,
    formatNumber: createNumberFormatter(options.numberFormat),
  };

  return flatten(map(seriesList, series => prepareSeries(series, options, additionalOptions)));
}
