import { isArray, isObject, isString, isFunction, startsWith, reduce, merge, map, each, isNil } from "lodash";
import resizeObserver from "@/services/resizeObserver";
import { Plotly, prepareData, prepareLayout, updateData, updateAxes, updateChartSize } from "../plotly";
import { formatSimpleTemplate } from "@/lib/value-format";

const navigateToUrl = (url, shouldOpenNewTab = true) =>
  shouldOpenNewTab
    ? window.open(url, "_blank")
    : window.location.href = url;

function createErrorHandler(errorHandler) {
  return (error) => {
    // This error happens only when chart width is 20px and looks that
    // it's safe to just ignore it: 1px less or more and chart will get fixed.
    if (isString(error) && startsWith(error, "ax.dtick error")) {
      return;
    }
    errorHandler(error);
  };
}

// This utility is intended to reduce amount of plot updates when multiple Plotly.relayout
// calls needed in order to compute/update the plot.
// `.append()` method takes an array of two element: first one is a object with updates for layout,
// and second is an optional function that will be called when plot is updated. That function may
// return an array with same structure if further updates needed.
// `.process()` merges all updates into a single object and calls `Plotly.relayout()`. After that
// it calls all callbacks, collects their return values and does another loop if needed.
function initPlotUpdater() {
  let actions = [];

  const updater = {
    append(action) {
      if (isArray(action) && isObject(action[0])) {
        actions.push(action);
      }
      return updater;
    },
    // @ts-expect-error ts-migrate(7023) FIXME: 'process' implicitly has return type 'any' because... Remove this comment to see the full error message
    process(plotlyElement) {
      if (actions.length > 0) {
        const updates = reduce(actions, (updates, action) => merge(updates, action[0]), {});
        const handlers = map(actions, action => (isFunction(action[1]) ? action[1] : () => null));
        actions = [];
        return Plotly.relayout(plotlyElement, updates).then(() => {
          each(handlers, handler => updater.append(handler()));
          return updater.process(plotlyElement);
        });
      } else {
        return Promise.resolve();
      }
    },
  };

  return updater;
}

export default function initChart(container, options, data, additionalOptions, onError) {
  const handleError = createErrorHandler(onError);

  const plotlyOptions = {
    showLink: false,
    displaylogo: false,
  };

  if (additionalOptions.hidePlotlyModeBar) {
    plotlyOptions.displayModeBar = false;
  }

  const plotlyData = prepareData(data, options);
  const plotlyLayout = prepareLayout(container, options, plotlyData);

  let isDestroyed = false;

  let updater = initPlotUpdater();

  function createSafeFunction(fn) {
    return (...args) => {
      if (!isDestroyed) {
        try {
          return fn(...args);
        } catch (error) {
          handleError(error);
        }
      }
    };
  }

  let unwatchResize = () => {};

  const promise = Promise.resolve()
    .then(() => Plotly.newPlot(container, plotlyData, plotlyLayout, plotlyOptions))
    .then(
      createSafeFunction(() =>
        updater
          .append(updateAxes(container, plotlyData, plotlyLayout, options))
          .append(updateChartSize(container, plotlyLayout, options))
          .process(container)
      )
    )
    .then(
      createSafeFunction(() => {
        container.on(
          "plotly_restyle",
          createSafeFunction((updates) => {
            // This event is triggered if some plotly data/layout has changed.
            // We need to catch only changes of traces visibility to update stacking
            if (isArray(updates) && isObject(updates[0]) && updates[0].visible) {
              updateData(plotlyData, options);
              updater.append(updateAxes(container, plotlyData, plotlyLayout, options)).process(container);
            }
          })
        );
        options.onHover && container.on("plotly_hover", options.onHover);
        options.onUnHover && container.on("plotly_unhover", options.onUnHover);
        container.on('plotly_click',
          createSafeFunction((data) => {
            if (options.enableLink === true) {
              try {
                var templateValues = {}
                data.points.forEach((point, i) => {
                  var sourceDataElement = [...point.data?.sourceData?.entries()][point.pointNumber ?? 0]?.[1]?.row ?? {};

                  if (isNil(templateValues['@@x'])) templateValues['@@x'] = sourceDataElement.x;
                  if (isNil(templateValues['@@y'])) templateValues['@@y'] = sourceDataElement.y;

                  templateValues[`@@y${i + 1}`] = sourceDataElement.y;
                  templateValues[`@@x${i + 1}`] = sourceDataElement.x;
                })
                navigateToUrl(
                  formatSimpleTemplate(options.linkFormat, templateValues).replace(/{{\s*([^\s]+?)\s*}}/g, () => ''),
                  options.linkOpenNewTab);
              } catch (error) {
                console.error('Click error: [%s]', error.message, { error });
              }
            }
          }));

        unwatchResize = resizeObserver(
          container,
          createSafeFunction(() => {
            updater.append(updateChartSize(container, plotlyLayout, options)).process(container);
          })
        );
      })
    )
    .catch(handleError);

  const result = {
    initialized: promise.then(() => result),
    setZoomEnabled: createSafeFunction(allowZoom => {
      const layoutUpdates = { dragmode: allowZoom ? "zoom" : false };
      return Plotly.relayout(container, layoutUpdates);
    }),
    destroy: createSafeFunction(() => {
      isDestroyed = true;
      container.removeAllListeners("plotly_restyle");
      unwatchResize();
      delete container.__previousSize; // added by `updateChartSize`
      Plotly.purge(container);
    }),
  };

  return result;
}
