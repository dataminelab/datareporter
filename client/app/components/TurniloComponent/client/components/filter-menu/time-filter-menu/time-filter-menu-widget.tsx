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

import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { RelativeTimeFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { BubbleMenu } from "../../bubble-menu/bubble-menu";
import { ButtonGroup } from "../../button-group/button-group";
import { FixedTimeTab } from "./fixed-time-tab-widget";
import { PresetTimeTab } from "./preset-time-tab-widget";
import "./time-filter-menu.scss";

const MENU_WIDTH = 250;

interface TabSelectorProps {
  selectedTab: TimeFilterTab;
  onTabSelect: Unary<TimeFilterTab, void>;
}

function tabTitle(tab: TimeFilterTab) {
  return tab === TimeFilterTab.RELATIVE ? STRINGS.relative : STRINGS.fixed;
}

const TabSelector: React.FunctionComponent<TabSelectorProps> = props => {
  const { selectedTab, onTabSelect } = props;
  const tabs = [TimeFilterTab.RELATIVE, TimeFilterTab.FIXED].map(tab => {
    return {
      isSelected: selectedTab === tab,
      title: tabTitle(tab),
      key: tab,
      onClick: () => onTabSelect(tab)
    };
  });
  return <ButtonGroup groupMembers={tabs} />;
};

export interface TimeFilterMenuProps {
  clickerList: Clicker[];
  timekeeper: Timekeeper;
  essenceList: Essence[];
  dimension: Dimension;
  onClose: Fn;
  setEssence: Fn;
  containerStage?: Stage;
  openOn: Element;
  inside?: Element;
  widgetList: Number[];
}

enum TimeFilterTab { RELATIVE = "relative", FIXED = "fixed"}

export interface TimeFilterMenuState {
  tab: TimeFilterTab;
}

function initialTab(essence: Essence): TimeFilterTab {
  const isRelativeTimeFilter = essence.timeFilter() instanceof RelativeTimeFilterClause;
  return isRelativeTimeFilter ? TimeFilterTab.RELATIVE : TimeFilterTab.FIXED;
}

export class TimeFilterMenu extends React.Component<TimeFilterMenuProps, TimeFilterMenuState> {

  state: TimeFilterMenuState = { tab: initialTab(this.props.essenceList[0]) };

  selectTab = (tab: TimeFilterTab) => this.setState({ tab });

  render() {
    const { essenceList, timekeeper, clickerList, dimension, onClose, containerStage, openOn, inside, setEssence, widgetList } = this.props;
    if (!dimension) return null;
    const clicker = clickerList[0];
    const essence = essenceList[0];
    const { tab } = this.state;
    const menuSize = Stage.fromSize(MENU_WIDTH, 410);
    const isRelativeTab = tab === TimeFilterTab.RELATIVE;
    const tabProps = { essence, essenceList, dimension, timekeeper, onClose, clicker, clickerList, setEssence, widgetList };

    return <BubbleMenu
      className="time-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      <TabSelector selectedTab={tab} onTabSelect={this.selectTab} />
      {isRelativeTab ? <PresetTimeTab {...tabProps} /> : <FixedTimeTab {...tabProps} />}
    </BubbleMenu>;
  }
}
