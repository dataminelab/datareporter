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

import { Timezone } from "chronoshift";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause, isTimeFilter } from "../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { getFormattedClause } from "../../../common/utils/formatter/formatter";
import { Deferred } from "../../../common/utils/promise/promise";
import { Fn } from "../../../common/utils/general/general";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { classNames, findParentWithClass, getXFromEvent, isInside, setDragData, setDragGhost, transformStyle, uniqueId } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems, SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { AddTile } from "../add-tile/add-tile";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { FancyDragIndicator } from "../drag-indicator/fancy-drag-indicator";
import { FilterMenu } from "../filter-menu/filter-menu-widget";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./filter-tile-widget.scss";

const FILTER_CLASS_NAME = "filter";

export interface ItemBlank {
  dimension: Dimension;
  source: string;
  clause?: FilterClause;
}

function formatLabelDummy(dimension: Dimension): string {
  return dimension.title;
}

export interface FilterTileProps {
  essenceList: Essence[];
  clickerList: Clicker[];
  widgetList: number[];
  setEssence: Fn;
  timekeeper: Timekeeper;
  stage: Stage;
}

export interface FilterTileState {
  menuOpenOn?: Element;
  menuDimension?: Dimension;
  menuInside?: Element;
  overflowMenuOpenOn?: Element;
  dragPosition?: DragPosition;
  possibleDimension?: Dimension;
  possiblePosition?: DragPosition;
  maxItems?: number;
  maxWidth?: number;
}

export class FilterTile extends React.Component<FilterTileProps, FilterTileState> {
  private readonly overflowMenuId: string;
  private dummyDeferred: Deferred<Element>;
  private overflowMenuDeferred: Deferred<Element>;
  private items = React.createRef<HTMLDivElement>();
  private overflow = React.createRef<HTMLDivElement>();
  private dimensionRef = React.createRef<HTMLDivElement>();

  constructor(props: FilterTileProps) {
    super(props);
    this.overflowMenuId = uniqueId("overflow-menu-");
    this.state = {
      menuOpenOn: null,
      menuDimension: null,
      menuInside: null,
      overflowMenuOpenOn: null,
      dragPosition: null,
      possibleDimension: null,
      possiblePosition: null,
      maxItems: 20
    };
  }

  componentWillReceiveProps(nextProps: FilterTileProps) {
    const { stage } = nextProps;

    if (stage) {
      const newMaxItems = getMaxItems(stage.width, this.getItemBlanks().length);
      if (newMaxItems !== this.state.maxItems) {
        this.setState({
          menuOpenOn: null,
          menuDimension: null,
          menuInside: null,
          possibleDimension: null,
          possiblePosition: null,
          overflowMenuOpenOn: null,
          maxItems: newMaxItems
        });
      }
    }
  }

  componentDidUpdate() {
    const { possibleDimension, overflowMenuOpenOn } = this.state;

    if (possibleDimension) {
      this.dummyDeferred.resolve(null);
    }

    if (overflowMenuOpenOn) {
      this.overflowMenuDeferred.resolve(null);
    }
  }

  overflowButtonTarget(): Element {
    return this.overflow.current;
  }

  getOverflowMenu(): Element {
    return document.getElementById(this.overflowMenuId);
  }

  clickDimension(dimension: Dimension, e: React.MouseEvent<HTMLElement>) {
    const target = findParentWithClass(e.target as Element, FILTER_CLASS_NAME);
    this.toggleMenu(dimension, target);
    e.stopPropagation();
  }

  openMenuOnDimension(dimension: Dimension) {
    const targetRef = this.refs[dimension.name];
    if (targetRef) {
      const target = ReactDOM.findDOMNode(targetRef) as Element;
      if (!target) return;
      this.openMenu(dimension, target);
    } else {
      const overflowButtonTarget = this.overflowButtonTarget();
      if (overflowButtonTarget) {
        this.openOverflowMenu(overflowButtonTarget).then(() => {
          const target = ReactDOM.findDOMNode(this.refs[dimension.name]) as Element;
          if (!target) return;
          this.openMenu(dimension, target);
        });
      }
    }
  }

  toggleMenu(dimension: Dimension, target: Element) {
    const { menuOpenOn } = this.state;
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }
    this.openMenu(dimension, target);
  }

  openMenu(dimension: Dimension, target: Element) {
    const overflowMenu = this.getOverflowMenu();
    const menuInside = overflowMenu && isInside(target, overflowMenu) ? overflowMenu : null;
    this.setState({
      menuOpenOn: target,
      menuDimension: dimension,
      menuInside
    });
  }

  closeMenu = () => {
    const { menuOpenOn, possibleDimension } = this.state;
    if (!menuOpenOn) return;
    const newState: FilterTileState = {
      menuOpenOn: null,
      menuDimension: null,
      menuInside: null,
      possibleDimension: null,
      possiblePosition: null
    };
    if (possibleDimension) {
      // If we are adding a ghost dimension also close the overflow menu
      // This is so it does not remain phantom open with nothing inside
      newState.overflowMenuOpenOn = null;
    }
    this.setState(newState);
  };

  openOverflowMenu(target: Element): Promise<Element> {
    if (!target) return Promise.resolve(null);
    const { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn === target) {
      this.closeOverflowMenu();
      return Promise.resolve(null);
    }

    this.overflowMenuDeferred = new Deferred();
    this.setState({ overflowMenuOpenOn: target });
    return this.overflowMenuDeferred.promise;
  }

  closeOverflowMenu = () => {
    const { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return;
    this.setState({
      overflowMenuOpenOn: null
    });
  };

  removeFilter(itemBlank: ItemBlank, e: MouseEvent) {
    const { essenceList, clickerList } = this.props;
    if (itemBlank.clause) {
      clickerList[0].changeFilter(essenceList[0].filter.removeClause(itemBlank.clause.reference));
    }
    this.closeMenu();
    this.closeOverflowMenu();
    e.stopPropagation();
  }

  dragStart(dimension: Dimension, clause: FilterClause, e: DragEvent) {
    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", dimension.title);

    DragManager.setDragFilter(clause);

    setDragGhost(dataTransfer, dimension.title);

    this.closeMenu();
    this.closeOverflowMenu();
  }

  calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition {
    const { essenceList } = this.props;
    const numItems = essenceList[0].filter.length();
    const rect = this.items.current.getBoundingClientRect();
    const offset = getXFromEvent(e) - rect.left;
    return DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
  }

  canDrop(): boolean {
    const { essenceList } = this.props;
    const { filter } = essenceList[0];
    const dimension = DragManager.draggingDimension();
    if (dimension) return !filter.getClauseForDimension(dimension);
    if (DragManager.isDraggingSplit()) {
      return !filter.clauseForReference(DragManager.draggingSplit().reference);
    }
    return DragManager.isDraggingFilter();
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  };

  dragLeave = () => {
    this.setState({ dragPosition: null });
  };

  draggingDimension(): Dimension {
    const { essenceList } = this.props;
    const { dataCube } = essenceList[0]
    if (DragManager.isDraggingSplit()) {
      return dataCube.getDimension(DragManager.draggingSplit().reference);
    }
    return DragManager.draggingDimension();
  }

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();

    this.setState({ dragPosition: null });

    const dragPosition = this.calculateDragPosition(e);

    if (DragManager.isDraggingFilter()) {
      this.dropFilter(dragPosition);
      return;
    }
    this.dropDimension(dragPosition);
  };

  private dropDimension(dragPosition: DragPosition) {
    const { essenceList } = this.props;
    const { filter, dataCube } = essenceList[0];
    const dimension = this.draggingDimension();
    let tryingToReplaceTime = false;
    if (dragPosition.replace !== null) {
      const targetClause = filter.clauses.get(dragPosition.replace);
      tryingToReplaceTime = targetClause && targetClause.reference === dataCube.getTimeDimension().name;
    }
    if (dragPosition && !tryingToReplaceTime) {
      this.addDummy(dimension, dragPosition);
    }
  }

  private dropFilter(dragPosition: DragPosition) {
    const { clickerList, essenceList } = this.props;
    const { filter } = essenceList[0];
    const clause = DragManager.draggingFilter();
    const newFilter = dragPosition.isReplace()
      ? filter.replaceByIndex(dragPosition.replace, clause)
      : filter.insertByIndex(dragPosition.insert, clause);
    !filter.equals(newFilter) && clickerList[0].changeFilter(newFilter);
  }

  appendFilter = (dimension: Dimension) => {
    this.addDummy(dimension, new DragPosition({ insert: this.props.essenceList[0].filter.length() }));
  };

  addDummy(dimension: Dimension, possiblePosition: DragPosition) {
    this.dummyDeferred = new Deferred<Element>();
    this.setState({
      possibleDimension: dimension,
      possiblePosition
    });
    this.dummyDeferred.promise.then(() => {
      this.openMenuOnDimension(dimension);
    });
  }

  // This will be called externally
  filterMenuRequest(dimension: Dimension) {
    const { filter } = this.props.essenceList[0];
    if (filter.filteredOn(dimension.name)) {
      this.openMenuOnDimension(dimension);
    } else {
      this.addDummy(dimension, new DragPosition({ insert: filter.length() }));
    }
  }

  overflowButtonClick = () => {
    this.openOverflowMenu(this.overflowButtonTarget());
  };

  renderMenu(): JSX.Element {
    const { essenceList, timekeeper, clickerList, widgetList, stage, setEssence } = this.props;
    const { menuOpenOn, menuDimension, menuInside, maxItems, overflowMenuOpenOn } = this.state;
    let { possiblePosition } = this.state;
    if (!menuDimension) return null;

    if (possiblePosition && possiblePosition.replace === maxItems) {
      possiblePosition = new DragPosition({ insert: possiblePosition.replace });
    }

    return <FilterMenu
      essenceList={essenceList}
      clickerList={clickerList}
      widgetList={widgetList}
      setEssence={setEssence}
      timekeeper={timekeeper}
      containerStage={overflowMenuOpenOn ? null : stage}
      openOn={menuOpenOn}
      dimension={menuDimension}
      changePosition={possiblePosition}
      onClose={this.closeMenu}
      inside={menuInside}
    />;
  }

  renderOverflowMenu(overflowItemBlanks: ItemBlank[]): JSX.Element {
    const { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return null;

    const segmentHeight = 29 + CORE_ITEM_GAP;

    const filterItems = overflowItemBlanks.map((itemBlank, index) => {
      const style = transformStyle(0, CORE_ITEM_GAP + index * segmentHeight);
      return this.renderItemBlank(itemBlank, style);
    });

    const stageHeight = CORE_ITEM_GAP + filterItems.length * segmentHeight;
    return <BubbleMenu
      className="overflow-menu"
      id={this.overflowMenuId}
      direction="down"
      stage={Stage.fromSize(208, stageHeight)}
      fixedSize={true}
      openOn={overflowMenuOpenOn}
      onClose={this.closeOverflowMenu}
    >
      {filterItems}
    </BubbleMenu>;
  }

  renderOverflow(overflowItemBlanks: ItemBlank[], itemX: number): JSX.Element {
    const style = transformStyle(itemX, 0);

    return <div
      className="overflow dimension"
      ref={this.overflow}
      key="overflow"
      style={style}
      onClick={this.overflowButtonClick}
    >
      <div className="count">{"+" + overflowItemBlanks.length}</div>
      {this.renderOverflowMenu(overflowItemBlanks)}
    </div>;
  }

  renderRemoveButton(itemBlank: ItemBlank) {
    const { essenceList } = this.props;
    const dataCube = essenceList[0].dataCube;
    if (itemBlank.dimension.expression.equals(dataCube.timeAttribute)) return null;
    return <div className="remove" onClick={this.removeFilter.bind(this, itemBlank)}>
      <SvgIcon svg={require("../../icons/x.svg")} />
    </div>;
  }

  renderTimeShiftLabel(dimension: Dimension): string {
    const { essenceList } = this.props;
    if (!dimension.expression.equals(essenceList[0].dataCube.timeAttribute)) return null;
    if (!essenceList[0].hasComparison()) return null;
    return `(Shift: ${essenceList[0].timeShift.getDescription(true)})`;
  }

  renderItemLabel(dimension: Dimension, clause: FilterClause, timezone: Timezone): JSX.Element {
    const { title, values } = getFormattedClause(dimension, clause, timezone);
    const timeShift = this.renderTimeShiftLabel(dimension);

    return <div className="reading">
      {title ? <span className="dimension-title">{title}</span> : null}
      <span className="values">{values} {timeShift}</span>
    </div>;
  }

  renderItemBlank(itemBlank: ItemBlank, style: any): JSX.Element {
    const { essenceList } = this.props;
    const { timezone } = essenceList[0];
    const { menuDimension } = this.state;

    const { dimension, clause, source } = itemBlank;
    const dimensionName = dimension.name;

    const selected = dimension === menuDimension;
    const excluded = clause && !isTimeFilter(clause) && clause.not;
    const className = classNames(FILTER_CLASS_NAME, "dimension", source, { selected, excluded, included: !excluded });

    if (clause) {
      return <div
        className={className}
        key={dimensionName}
        ref={this.dimensionRef}
        draggable={true}
        onClick={this.clickDimension.bind(this, dimension)}
        onDragStart={this.dragStart.bind(this, dimension, clause)}
        style={style}
      >
        {this.renderItemLabel(dimension, clause, timezone)}
        {this.renderRemoveButton(itemBlank)}
      </div>;
    } else {
      return <div
        className={className}
        key={dimensionName}
        ref={dimensionName}
        style={style}
      >
        <div className="reading">{formatLabelDummy(dimension)}</div>
        {this.renderRemoveButton(itemBlank)}
      </div>;
    }
  }

  getItemBlanks(): ItemBlank[] {
    const { essenceList } = this.props;
    const { possibleDimension, maxItems } = this.state;
    const { dataCube, filter } = essenceList[0];
    let { possiblePosition } = this.state;

    let itemBlanks = filter.clauses.toArray()
      .map((clause): ItemBlank => {
        const dimension = dataCube.getDimension(clause.reference);
        if (!dimension) return null;
        return {
          dimension,
          source: "from-filter",
          clause
        };
      })
      .filter(Boolean);

    if (possibleDimension && possiblePosition) {
      const dummyBlank: ItemBlank = {
        dimension: possibleDimension,
        source: "from-drag"
      };
      if (possiblePosition.replace === maxItems) {
        possiblePosition = new DragPosition({ insert: possiblePosition.replace });
      }
      if (possiblePosition.isInsert()) {
        itemBlanks.splice(possiblePosition.insert, 0, dummyBlank);
      } else {
        itemBlanks[possiblePosition.replace] = dummyBlank;
      }
    }

    return itemBlanks;
  }

  renderAddButton() {
    const { essenceList, stage } = this.props;
    const { dataCube, filter } = essenceList[0];
    const tiles = dataCube.dimensions
      .filterDimensions(dimension => !filter.getClauseForDimension(dimension))
      .map(dimension => {
        return {
          key: dimension.name,
          label: dimension.title,
          value: dimension
        };
      });

    return <AddTile<Dimension>
      containerStage={stage}
      insertSplit={this.appendFilter}
      appendSplit={this.appendFilter}
      tiles={tiles}
    />;
  }

  render() {
    const { dragPosition, maxItems } = this.state;
    const itemBlanks = this.getItemBlanks();

    const filterItems = itemBlanks.slice(0, maxItems).map((item, index) => {
      const style = transformStyle(index * SECTION_WIDTH, 0);
      return this.renderItemBlank(item, style);
    });

    const overflow = itemBlanks.slice(maxItems);
    if (overflow.length > 0) {
      const overFlowStart = filterItems.length * SECTION_WIDTH;
      filterItems.push(this.renderOverflow(overflow, overFlowStart));
    }

    return <div
      className="filter-tile-widget"
      onDragEnter={this.dragEnter}
    >
      <div className="title">{STRINGS.filter}</div>
      <div className="items" ref={this.items}>
        {filterItems}
      </div>
      {this.renderAddButton()}
      {dragPosition ? <FancyDragIndicator dragPosition={dragPosition} /> : null}
      {dragPosition ? <div
        className="drag-mask"
        onDragOver={this.dragOver}
        onDragLeave={this.dragLeave}
        onDragExit={this.dragLeave}
        onDrop={this.drop}
      /> : null}
      {this.renderMenu()}
    </div>;
  }
}
