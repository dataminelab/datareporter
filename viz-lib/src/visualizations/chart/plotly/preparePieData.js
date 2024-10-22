import { isString, each, extend, includes, map, reduce } from "lodash";
import d3 from "d3";
import chooseTextColorForBackground from "@/lib/chooseTextColorForBackground";
import { AllColorPaletteArrays, ColorPaletteTypes } from "@/visualizations/ColorPalette";
import { cleanNumber, normalizeValue } from "./utils";

export function getPieDimensions(series) {
  const rows = series.length > 2 ? 2 : 1;
  const cellsInRow = Math.ceil(series.length / rows);
  const cellWidth = 1 / cellsInRow;
  const cellHeight = 1 / rows;
  const xPadding = 0.02;
  const yPadding = 0.1;

  return { rows, cellsInRow, cellWidth, cellHeight, xPadding, yPadding };
}

function getPieHoverInfoPattern(options) {
  const hasX = /{{\s*@@x\s*}}/.test(options.textFormat);
  let result = "text";
  if (!hasX) result += "+label";
  return result;
}

function prepareSeries(series, options, additionalOptions) {
  const {
    cellWidth,
    cellHeight,
    xPadding,
    yPadding,
    cellsInRow,
    hasX,
    index,
    hoverInfoPattern,
    getValueColor,
  } = additionalOptions;

  const seriesOptions = extend({ type: options.globalSeriesType, yAxis: 0 }, options.seriesOptions[series.name]);

  const xPosition = (index % cellsInRow) * cellWidth;
  const yPosition = Math.floor(index / cellsInRow) * cellHeight;

  const labels = [];
  const values = [];
  const sourceData = new Map();
  const seriesTotal = reduce(
    series.data,
    (result, row) => {
      const y = cleanNumber(row.y);
      return result + Math.abs(y);
    },
    0
  );
  each(series.data, row => {
    const x = hasX ? normalizeValue(row.x, options.xAxis.type) : `Slice ${index}`;
    const y = cleanNumber(row.y);
    labels.push(x);
    values.push(y);
    sourceData.set(x, {
      x,
      y,
      yPercent: (y / seriesTotal) * 100,
      row,
    });
  });

  const markerColors = map(series.data, row => getValueColor(row.x));
  const textColors = map(markerColors, c => chooseTextColorForBackground(c));

  return {
    visible: true,
    values,
    labels,
    type: "pie",
    hole: 0.4,
    marker: {
      colors: markerColors,
    },
    hoverinfo: hoverInfoPattern,
    text: [],
    textinfo: options.showDataLabels ? "percent" : "none",
    textposition: "inside",
    textfont: {
      color: textColors,
    },
    name: seriesOptions.name || series.name,
    direction: options.direction.type,
    domain: {
      x: [xPosition, xPosition + cellWidth - xPadding],
      y: [yPosition, yPosition + cellHeight - yPadding],
    },
    sourceData,
  };
}

export default function preparePieData(seriesList, options) {
  const palette = AllColorPaletteArrays[options.color_scheme];
  const valuesColors = {};
  let getDefaultColor;

  if (typeof (seriesList[0]) !== 'undefined' && ColorPaletteTypes[options.color_scheme] === 'continuous') {
    const uniqueXValues = [... new Set(seriesList[0].data.map((d) => d.x))];
    const step = (palette.length - 1) / (uniqueXValues.length - 1 || 1);
    const colorIndices = d3.range(uniqueXValues.length).map(function (i) {
      return Math.round(step * i);
    });
    getDefaultColor = d3.scaleOrdinal()
      .domain(uniqueXValues) // Set domain as the unique x-values
      .range(colorIndices.map((index) => palette[index]));
  } else {
    getDefaultColor = d3.scale
      .ordinal()
      .domain([])
      .range(palette);
  };

  each(options.valuesOptions, (item, key) => {
    if (isString(item.color) && item.color !== "") {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      valuesColors[key] = item.color;
    }
  });

  const additionalOptions = {
    ...getPieDimensions(seriesList),
    hasX: includes(options.columnMapping, "x"),
    hoverInfoPattern: getPieHoverInfoPattern(options),
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    getValueColor: (v) => valuesColors[v] || getDefaultColor(v),
  };

  return map(seriesList, (series, index) => prepareSeries(series, options, { ...additionalOptions, index }));
}
