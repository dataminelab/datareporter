import { isString, isObject, isFinite, each, map, extend, uniq, filter, first } from "lodash";
import chroma from "chroma-js";
import { createNumberFormatter as createFormatter } from "@/lib/value-format";

export function darkenColor(color) {
  return chroma(color)
    .darken()
    .hex();
}

export function createNumberFormatter(format, placeholder) {
  const formatter = createFormatter(format);
  return (value) => {
    if (isFinite(value)) {
      return formatter(value);
    }
    return placeholder;
  };
}

export function prepareData(data, keyColumn, valueColumn) {
  if (!keyColumn || !valueColumn) {
    return {};
  }

  const result = {};
  each(data, item => {
    if (item[keyColumn]) {
      const value = parseFloat(item[valueColumn]);
      result[item[keyColumn]] = {
        code: item[keyColumn],
        value: isFinite(value) ? value : undefined,
        item,
      };
    }
  });
  return result;
}

export function prepareFeatureProperties(feature, valueFormatted, data, targetField) {
  const result = {};
  each(feature.properties, (value, key) => {
    result["@@" + key] = value;
  });
  result["@@value"] = valueFormatted;
  const datum = data[feature.properties[targetField]] || {};
  return extend(result, datum.item);
}

export function getValueForFeature(feature, data, targetField) {
  const code = feature.properties[targetField];
  if (isString(code) && isObject(data[code])) {
    return data[code].value;
  }
  return undefined;
}

export function getColorByValue(value, limits, colors, defaultColor) {
  if (isFinite(value)) {
    for (let i = 0; i < limits.length; i += 1) {
      if (value <= limits[i]) {
        return colors[i];
      }
    }
  }
  return defaultColor;
}

export function createScale(features, data, options) {
  // Calculate limits
  const values = uniq(
    filter(
      map(features, feature => getValueForFeature(feature, data, options.targetField)),
      isFinite
    )
  );
  if (values.length === 0) {
    return {
      limits: [],
      colors: [],
      legend: [],
    };
  }
  const steps = Math.min(values.length, options.steps);
  if (steps === 1) {
    return {
      limits: values,
      colors: [options.colors.max],
      legend: [
        {
          color: options.colors.max,
          limit: first(values),
        },
      ],
    };
  }
  const limits = chroma.limits(values, options.clusteringMode, steps - 1);

  // Create color buckets
  const colors = chroma.scale([options.colors.min, options.colors.max]).colors(limits.length);

  // Group values for legend
  const legend = map(colors, (color, index) => ({
    color,
    limit: limits[index],
  })).reverse();

  return { limits, colors, legend };
}
