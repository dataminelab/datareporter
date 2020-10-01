/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import memoizeOne from "memoize-one";
import { Dataset, TabulatorOptions } from "plywood";
import * as React from "react";
import { CSSTransition } from "react-transition-group";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Customization } from "../../../common/models/customization/customization";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Device, DeviceSize } from "../../../common/models/device/device";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Filter } from "../../../common/models/filter/filter";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Split } from "../../../common/models/split/split";
import { Splits } from "../../../common/models/splits/splits";
import { Stage } from "../../../common/models/stage/stage";
import { TimeShift } from "../../../common/models/time-shift/time-shift";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { VisualizationManifest } from "../../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { VisualizationSettings } from "../../../common/models/visualization-settings/visualization-settings";
import { Binary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { datesEqual } from "../../../common/utils/time/time";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { SideDrawer } from "../../components/side-drawer/side-drawer";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import * as localStorage from "../../utils/local-storage/local-storage";
import tabularOptions from "../../utils/tabular-options/tabular-options";
import { getVisualizationComponent } from "../../visualizations";
import { CubeContext, CubeContextValue } from "./cube-context";
import "./cube-view.scss";

export interface CubeViewLayout {
  factPanel: {
    width: number;
    hidden?: boolean;
  };
  pinboard: {
    width: number;
    hidden?: boolean;
  };
}

const defaultLayout: CubeViewLayout = {
  factPanel: { width: 240 },
  pinboard: { width: 240 }
};

export interface CubeViewProps {
  initTimekeeper?: Timekeeper;
  maxFilters?: number;
  hash: string;
  changeDataCubeAndEssence: Binary<DataCube, Essence | null, void>;
  changeEssence: Binary<Essence, boolean, void>;
  urlForEssence: Unary<Essence, string>;
  getEssenceFromHash: Binary<string, DataCube, Essence>;
  dataCube: DataCube;
  openAboutModal: Fn;
  customization?: Customization;
  appSettings: AppSettings;
}

export interface CubeViewState {
  essence?: Essence;
  timekeeper?: Timekeeper;
  visualizationStage?: Stage;
  menuStage?: Stage;
  dragOver?: boolean;
  showSideBar?: boolean;
  showRawDataModal?: boolean;
  showViewDefinitionModal?: boolean;
  showDruidQueryModal?: boolean;
  urlShortenerModalProps?: { url: string, title: string };
  layout?: CubeViewLayout;
  deviceSize?: DeviceSize;
  updatingMaxTime?: boolean;
  lastRefreshRequestTimestamp: number;
}

const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;

export interface DataSetWithTabOptions {
  dataset: Dataset;
  options?: TabulatorOptions;
}

export class CubeView extends React.Component<CubeViewProps, CubeViewState> {
  static defaultProps: Partial<CubeViewProps> = { maxFilters: 20 };

  private static canDrop(): boolean {
    return DragManager.draggingDimension() !== null;
  }

  public mounted: boolean;
  private readonly clicker: Clicker;
  private downloadableDataset: DataSetWithTabOptions;
  private visualization = React.createRef<HTMLDivElement>();
  private container = React.createRef<HTMLDivElement>();

  constructor(props: CubeViewProps) {
    super(props);

    this.state = {
      essence: null,
      dragOver: false,
      layout: this.getStoredLayout(),
      lastRefreshRequestTimestamp: 0,
      updatingMaxTime: false
    };

    this.clicker = {
      changeFilter: (filter: Filter) => {
        this.setState(state => {
          let { essence } = state;
          essence = essence.changeFilter(filter);
          return { ...state, essence };
        });
      },
      changeComparisonShift: (timeShift: TimeShift) => {
        this.setState(state =>
          ({ ...state, essence: state.essence.changeComparisonShift(timeShift) }));
      },
      changeSplits: (splits: Splits, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeSplits(splits, strategy) });
      },
      changeSplit: (split: Split, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeSplit(split, strategy) });
      },
      addSplit: (split: Split, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.addSplit(split, strategy) });
      },
      removeSplit: (split: Split, strategy: VisStrategy) => {
        const { essence } = this.state;
        this.setState({ essence: essence.removeSplit(split, strategy) });
      },
      changeSeriesList: (seriesList: SeriesList) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeSeriesList(seriesList) });
      },
      addSeries: (series: Series) => {
        const { essence } = this.state;
        this.setState({ essence: essence.addSeries(series) });
      },
      removeSeries: (series: Series) => {
        const { essence } = this.state;
        this.setState({ essence: essence.removeSeries(series) });
      },
      changeVisualization: (visualization: VisualizationManifest, settings: VisualizationSettings) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changeVisualization(visualization, settings) });
      },
      pin: (dimension: Dimension) => {
        const { essence } = this.state;
        this.setState({ essence: essence.pin(dimension) });
      },
      unpin: (dimension: Dimension) => {
        const { essence } = this.state;
        this.setState({ essence: essence.unpin(dimension) });
      },
      changePinnedSortSeries: (series: Series) => {
        const { essence } = this.state;
        this.setState({ essence: essence.changePinnedSortSeries(series) });
      }
    };
  }

  refreshMaxTime = () => {
    const { essence, timekeeper } = this.state;
    const { dataCube } = essence;
    this.setState({ updatingMaxTime: true });

    DataCube.queryMaxTime(dataCube)
      .then(maxTime => {
        if (!this.mounted) return;
        const timeName = dataCube.name;
        const isBatchCube = !dataCube.refreshRule.isRealtime();
        const isCubeUpToDate = datesEqual(maxTime, timekeeper.getTime(timeName));
        if (isBatchCube && isCubeUpToDate) {
          this.setState({ updatingMaxTime: false });
          return;
        }
        this.setState({
          timekeeper: timekeeper.updateTime(timeName, maxTime),
          updatingMaxTime: false,
          lastRefreshRequestTimestamp: (new Date()).getTime()
        });
      });
  };

  componentWillMount() {
    const { hash, dataCube, initTimekeeper } = this.props;
    if (!dataCube) {
      throw new Error("Data cube is required.");
    }

    this.setState({
      timekeeper: initTimekeeper || Timekeeper.EMPTY
    });
    this.updateEssenceFromHashOrDataCube(hash, dataCube);
  }

  componentDidMount() {
    this.mounted = true;
    DragManager.init();
    this.globalResizeListener();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  updateEssenceFromHashOrDataCube(hash: string, dataCube: DataCube) {
    let essence: Essence;
    try {
      essence = this.getEssenceFromHash(hash, dataCube);
    } catch (e) {
      const { changeEssence } = this.props;
      essence = this.getEssenceFromDataCube(dataCube);
      changeEssence(essence, true);
    }
    this.setState({ essence });
  }

  getEssenceFromDataCube(dataCube: DataCube): Essence {
    return Essence.fromDataCube(dataCube);
  }

  getEssenceFromHash(hash: string, dataCube: DataCube): Essence {
    if (!dataCube) {
      throw new Error("Data cube is required.");
    }

    if (!hash) {
      throw new Error("Hash is required.");
    }

    const { getEssenceFromHash } = this.props;
    return getEssenceFromHash(hash, dataCube);
  }

  globalResizeListener = () => {
    const containerDOM = this.container.current;
    const visualizationDOM = this.visualization.current;
    if (!containerDOM || !visualizationDOM) return;

    this.setState({
      deviceSize: Device.getSize(),
      menuStage: Stage.fromClientRect(containerDOM.getBoundingClientRect()),
      visualizationStage: Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
    });
  };

  private isSmallDevice(): boolean {
    return this.state.deviceSize === DeviceSize.SMALL;
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!CubeView.canDrop()) return;
    e.preventDefault();
    this.setState({ dragOver: true });
  };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!CubeView.canDrop()) return;
    e.preventDefault();
  };

  getStoredLayout(): CubeViewLayout {
    return localStorage.get("cube-view-layout-v2") || defaultLayout;
  }

  storeLayout(layout: CubeViewLayout) {
    localStorage.set("cube-view-layout-v2", layout);
  }

  private updateLayout(layout: CubeViewLayout) {
    this.setState({ layout });
    this.storeLayout(layout);
  }

  toggleFactPanel = () => {
    const { layout: { factPanel }, layout } = this.state;
    this.updateLayout({
      ...layout,
      factPanel: {
        ...factPanel,
        hidden: !factPanel.hidden
      }
    });
  };

  togglePinboard = () => {
    const { layout: { pinboard }, layout } = this.state;
    this.updateLayout({
      ...layout,
      pinboard: {
        ...pinboard,
        hidden: !pinboard.hidden
      }
    });
  };

  onFactPanelResize = (width: number) => {
    const { layout: { factPanel }, layout } = this.state;
    this.updateLayout({
      ...layout,
      factPanel: {
        ...factPanel,
        width
      }
    });
  };

  onPinboardPanelResize = (width: number) => {
    const { layout: { pinboard }, layout } = this.state;
    this.updateLayout({
      ...layout,
      pinboard: {
        ...pinboard,
        width
      }
    });
  };

  onPanelResizeEnd = () => {
    this.globalResizeListener();
  };

  private getCubeContext(): CubeContextValue {
    const { essence } = this.state;
    /*
     React determine context value change using value reference.
     Because we're creating new object, reference would be different despite same values inside,
     hence memoization. More info: https://reactjs.org/docs/context.html#caveats
    */
    return this.constructContext(essence, this.clicker);
  }

  private constructContext = memoizeOne(
    (essence: Essence, clicker: Clicker) =>
      ({ essence, clicker }),
    ([nextEssence, nextClicker]: [Essence, Clicker], [prevEssence, prevClicker]: [Essence, Clicker]) =>
      nextEssence.equals(prevEssence) && nextClicker === prevClicker);

  render() {
    const { essence } = this.state;

    if (!essence) return null;

    return <CubeContext.Provider value={this.getCubeContext()}>
      <div className="turnilo-widget-view">
        <div className="main" ref={this.container}>
          <GlobalEventListener resize={this.globalResizeListener} />
          <div className="visualization" ref={this.visualization}>{this.visElement()}</div>
        </div>
      </div>
    </CubeContext.Provider>;
  }

  sideDrawerOpen = () => {
    this.setState({ showSideBar: true });
  };

  sideDrawerClose = () => {
    this.setState({ showSideBar: false });
  };

  renderSideDrawer() {
    const { changeDataCubeAndEssence, openAboutModal, appSettings } = this.props;
    const { showSideBar, essence } = this.state;
    const { dataCubes, customization } = appSettings;
    const transitionTimeout = { enter: 500, exit: 300 };
    return <CSSTransition
      in={showSideBar}
      classNames="side-drawer"
      mountOnEnter={true}
      unmountOnExit={true}
      timeout={transitionTimeout}
    >
      <SideDrawer
        key="drawer"
        essence={essence}
        dataCubes={dataCubes}
        onOpenAbout={openAboutModal}
        onClose={this.sideDrawerClose}
        customization={customization}
        changeDataCubeAndEssence={changeDataCubeAndEssence}
      />
    </CSSTransition>;
  }

  private visElement() {
    const { essence, visualizationStage: stage, lastRefreshRequestTimestamp } = this.state;
    if (!(essence.visResolve.isReady() && stage)) return null;
    const visProps: VisualizationProps = {
      refreshRequestTimestamp: lastRefreshRequestTimestamp,
      essence,
      clicker: this.clicker,
      timekeeper: this.state.timekeeper,
      stage,
      registerDownloadableDataset: (dataset: Dataset) => {
        this.downloadableDataset = { dataset, options: tabularOptions(essence) };
      }
    };

    return React.createElement(getVisualizationComponent(essence.visualization), visProps);
  }
}
