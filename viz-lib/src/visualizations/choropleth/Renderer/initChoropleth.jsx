import { isFunction, isObject, isArray, map } from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import { formatSimpleTemplate } from "@/lib/value-format";
import sanitize from "@/services/sanitize";
import resizeObserver from "@/services/resizeObserver";
import {
  createNumberFormatter,
  createScale,
  darkenColor,
  getColorByValue,
  getValueForFeature,
  prepareFeatureProperties,
} from "./utils";
import Legend from "./Legend";

const CustomControl = L.Control.extend({
  options: {
    position: "topright",
  },
  onAdd() {
    const div = document.createElement("div");
    div.className = "leaflet-bar leaflet-custom-toolbar";
    div.style.background = "#fff";
    div.style.backgroundClip = "padding-box";
    return div;
  },
  onRemove() {
    ReactDOM.unmountComponentAtNode(this.getContainer());
  },
});

function prepareLayer({ feature, layer, data, options, limits, colors, formatValue }) {
  const value = getValueForFeature(feature, data, options.targetField);
  const valueFormatted = formatValue(value);
  const featureData = prepareFeatureProperties(feature, valueFormatted, data, options.targetField);
  const color = getColorByValue(value, limits, colors, options.colors.noValue);

  layer.setStyle({
    color: options.colors.borders,
    weight: 1,
    fillColor: color,
    fillOpacity: 1,
  });

  if (options.tooltip.enabled) {
    layer.bindTooltip(sanitize(formatSimpleTemplate(options.tooltip.template, featureData)), { sticky: true });
  }

  if (options.popup.enabled) {
    layer.bindPopup(sanitize(formatSimpleTemplate(options.popup.template, featureData)));
  }

  layer.on("mouseover", () => {
    layer.setStyle({
      weight: 2,
      fillColor: darkenColor(color),
    });
  });
  layer.on("mouseout", () => {
    layer.setStyle({
      weight: 1,
      fillColor: color,
    });
  });
}

function validateBounds(bounds, fallbackBounds) {
  if (bounds) {
    bounds = L.latLngBounds(bounds[0], bounds[1]);
    if (bounds.isValid()) {
      return bounds;
    }
  }
  if (fallbackBounds && fallbackBounds.isValid()) {
    return fallbackBounds;
  }
  return null;
}

export default function initChoropleth(container, onBoundsChange) {
  const _map = L.map(container, {
    center: [0.0, 0.0],
    zoom: 1,
    zoomSnap: 0,
    scrollWheelZoom: false,
    maxBoundsViscosity: 1,
    attributionControl: false,
    fullscreenControl: true,
  });
  let _choropleth = null;
  const _legend = new CustomControl();

  function handleMapBoundsChange() {
    if (isFunction(onBoundsChange)) {
      const bounds = _map.getBounds();
      onBoundsChange([
        [bounds._southWest.lat, bounds._southWest.lng],
        [bounds._northEast.lat, bounds._northEast.lng],
      ]);
    }
  }

  let boundsChangedFromMap = false;
  const onMapMoveEnd = () => {
    handleMapBoundsChange();
  };
  _map.on("focus", () => {
    boundsChangedFromMap = true;
    _map.on("moveend", onMapMoveEnd);
  });
  _map.on("blur", () => {
    _map.off("moveend", onMapMoveEnd);
    boundsChangedFromMap = false;
  });

  function updateLayers(geoJson, data, options) {
    _map.eachLayer(layer => _map.removeLayer(layer));
    _map.removeControl(_legend);

    if (!isObject(geoJson) || !isArray(geoJson.features)) {
      _choropleth = null;
      _map.setMaxBounds(null);
      return;
    }

    const { limits, colors, legend } = createScale(geoJson.features, data, options);
    const formatValue = createNumberFormatter(options.valueFormat, options.noValuePlaceholder);

    _choropleth = L.geoJSON(geoJson, {
      onEachFeature(feature, layer) {
        prepareLayer({ feature, layer, data, options, limits, colors, formatValue });
      },
    }).addTo(_map);

    const mapBounds = _choropleth.getBounds();
    const bounds = validateBounds(options.bounds, mapBounds);
    _map.fitBounds(bounds, { animate: false, duration: 0 });

    // equivalent to `_map.setMaxBounds(mapBounds)` but without animation
    _map.options.maxBounds = mapBounds;
    _map.panInsideBounds(mapBounds, { animate: false, duration: 0 });

    // update legend
    console.log("legend", legend);
    if (options.legend.visible && legend.length > 0) {
      _legend.setPosition(options.legend.position.replace("-", ""));
      _map.addControl(_legend);
      ReactDOM.render(
        <Legend
          items={map(legend, item => ({ ...item, text: formatValue(item.limit) }))}
          alignText={options.legend.alignText}
        />,
        _legend.getContainer()
      );
    }
  }

  function updateBounds(bounds) {
    if (!boundsChangedFromMap) {
      const layerBounds = _choropleth ? _choropleth.getBounds() : _map.getBounds();
      bounds = validateBounds(bounds, layerBounds);
      if (bounds) {
        _map.fitBounds(bounds, { animate: false, duration: 0 });
      }
    }
  }

  const unwatchResize = resizeObserver(container, () => {
    _map.invalidateSize(false);
  });

  return {
    updateLayers,
    updateBounds,
    destroy() {
      unwatchResize();
      _map.removeControl(_legend); // _map.remove() does not cleanup controls - bug in Leaflet?
      _map.remove();
    },
  };
}
