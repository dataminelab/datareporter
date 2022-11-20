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

import { NamedArray } from "immutable-class";
import * as React from "react";
import { AppSettings } from "../../../common/models/app-settings/app-settings";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { UrlHashConverter, urlHashConverter } from "../../../common/utils/url-hash-converter/url-hash-converter";
import { Ajax } from "../../utils/ajax/ajax";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { CubeView } from "../../views/cube-view/cube-view-widget";
import { ErrorView } from "../../views/error-view/error-view";
import { NoDataView } from "../../views/no-data-view/no-data-view";
import "./turnilo-application.scss";

export interface TurniloApplicationProps {
  version: string;
  hashWidget: string;
  maxFilters?: number;
  appSettings: AppSettings;
  initTimekeeper?: Timekeeper;
}

export interface TurniloApplicationState {
  appSettings?: AppSettings;
  timekeeper?: Timekeeper;
  drawerOpen?: boolean;
  selectedItem?: DataCube;
  viewType?: ViewType;
  viewHash?: string;
  showAboutModal?: boolean;
  errorId?: string;
}

export type ViewType = "cube" | "no-data" | "general-error";

const ERROR: ViewType = "general-error";
export const CUBE: ViewType = "cube";
export const NO_DATA: ViewType = "no-data";

export class TurniloApplication extends React.Component<TurniloApplicationProps, TurniloApplicationState> {
  private hashUpdating = false;
  private readonly urlHashConverter: UrlHashConverter = urlHashConverter;
  state: TurniloApplicationState = {
    appSettings: null,
    drawerOpen: false,
    selectedItem: null,
    viewType: null,
    viewHash: null,
    showAboutModal: false,
    errorId: null
  };

  componentDidCatch(error: Error) {
    const errorId = reportError(error);
    this.setState({
      viewType: ERROR,
      errorId
    });
  }

  componentWillMount() {
    const { appSettings, initTimekeeper, hashWidget } = this.props;
    const { dataCubes } = appSettings;

    const hash = hashWidget;
    let viewType = this.getViewTypeFromHash(hash);

    if (!dataCubes.length) {
      this.setState({
        viewType: NO_DATA,
        viewHash: "",
        appSettings
      });
      return;
    }

    const viewHash = this.getViewHashFromHash(hash);
    let selectedItem: DataCube;

    if (this.viewTypeNeedsAnItem(viewType)) {
      selectedItem = this.getSelectedDataCubeFromHash(dataCubes, hash);
    }

    viewType = CUBE;
    selectedItem = dataCubes[0];

    this.setState({
      viewType,
      viewHash,
      selectedItem,
      appSettings,
      timekeeper: initTimekeeper || Timekeeper.EMPTY
    });
  }

  viewTypeNeedsAnItem(viewType: ViewType): boolean {
    return viewType === CUBE;
  }

  componentDidMount() {
    window.addEventListener("hashchange", this.globalHashChangeListener);

    Ajax.settingsVersionGetter = () => {
      const { appSettings } = this.state;
      return appSettings.getVersion();
    };
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.globalHashChangeListener);
  }

  globalHashChangeListener = () => {
    if (this.hashUpdating) return;
    this.hashToState(this.props.hashWidget);
  };

  hashToState(hash: string) {
    const { dataCubes } = this.state.appSettings;
    const viewType = this.getViewTypeFromHash(hash);
    const viewHash = this.getViewHashFromHash(hash);
    const newState: TurniloApplicationState = {
      viewType,
      viewHash,
      drawerOpen: false
    };

    if (this.viewTypeNeedsAnItem(viewType)) {
      const item = this.getSelectedDataCubeFromHash(dataCubes, hash);
      newState.selectedItem = item ? item : dataCubes[0];
    } else {
      newState.selectedItem = null;
    }

    this.setState(newState);
  }

  parseHash(hash: string): string[] {
    if (hash[0] === "#") hash = hash.slice(1);
    return hash.split("/");
  }

  getViewTypeFromHash(hash: string): ViewType {
    const appSettings = this.state.appSettings || this.props.appSettings;
    const { dataCubes } = appSettings;
    const viewType = this.parseHash(hash)[0];

    if (!dataCubes || !dataCubes.length) return NO_DATA;

    if (viewType === NO_DATA) return NO_DATA;

    return CUBE;
  }

  getSelectedDataCubeFromHash(dataCubes: DataCube[], hash: string): DataCube {
    // can change header from hash
    const parts = this.parseHash(hash);
    const dataCubeName = parts[0];

    return NamedArray.findByName(dataCubes, dataCubeName);
  }

  getViewHashFromHash(hash: string): string {
    const parts = this.parseHash(hash);
    if (parts.length < 2) return null;
    parts.shift();
    return parts.join("/");
  }

  changeHash(hash: string, force = false): void {
    this.hashUpdating = true;

    setTimeout(() => this.hashUpdating = false, 5);
    if (force) this.hashToState(hash);
  }

  updateEssenceInHash = (essence: Essence, force = false) => {
    const newHash = `${this.state.selectedItem.name}/${this.convertEssenceToHash(essence)}`;
    this.changeHash(newHash, force);
  };

  changeDataCubeWithEssence = (dataCube: DataCube, essence: Essence | null) => {
    const essenceHashPart = essence && this.convertEssenceToHash(essence);
    const hash = `${dataCube.name}/${essenceHashPart || ""}`;
    this.changeHash(hash, true);
  };

  urlForEssence = (essence: Essence): string => {
    return `${this.getUrlPrefix()}${this.convertEssenceToHash(essence)}`;
  };

  private convertEssenceToHash(essence: Essence): string {
    return this.urlHashConverter.toHash(essence);
  }

  getUrlPrefix(): string {
    const { origin, pathname } = window.location;
    const dataCubeName = `${this.state.selectedItem.name}/`;
    return `${origin}${pathname}#${dataCubeName}`;
  }

  openAboutModal = () => this.setState({ showAboutModal: true });

  renderView() {
    const { maxFilters } = this.props;
    const { viewType, viewHash, selectedItem, appSettings, timekeeper, errorId } = this.state;
    const { customization } = appSettings;

    switch (viewType) {
      case NO_DATA:
        return <NoDataView
          onOpenAbout={this.openAboutModal}
          customization={customization}
          appSettings={appSettings}
        />;

      case CUBE:
        return <CubeView
          key={selectedItem.name}
          dataCube={selectedItem}
          appSettings={appSettings}
          initTimekeeper={timekeeper}
          hash={viewHash}
          changeEssence={this.updateEssenceInHash}
          changeDataCubeAndEssence={this.changeDataCubeWithEssence}
          urlForEssence={this.urlForEssence}
          getEssenceFromHash={this.urlHashConverter.essenceFromHash}
          openAboutModal={this.openAboutModal}
          maxFilters={maxFilters}
          customization={customization}
        />;

      case ERROR:
        return <ErrorView errorId={errorId} />;

      default:
        throw new Error("unknown view");
    }
  }

  render() {
    return <React.StrictMode>
      <main className="turnilo-application">
        {this.renderView()}
      </main>
    </React.StrictMode>;
  }
}
