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
import { classNames } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./tile-header.scss";

export interface TileHeaderIcon {
  name: string;
  svg: string;
  onClick: React.MouseEventHandler<HTMLElement>;
  ref?: string | React.RefObject<any>;
  active?: boolean;
}

export interface TileHeaderProps {
  title: string;
  onDragStart?: React.DragEventHandler<HTMLElement>;
  icons?: TileHeaderIcon[];
}

export interface TileHeaderState {
}

class IconDiv extends React.Component<TileHeaderIcon, TileHeaderState> {
  private ref: React.RefObject<any>;
  constructor(props: Readonly<any>) {
    super(props);
    this.ref = React.createRef();
  }
  render() {
    const { name, svg, onClick, active } = this.props;
    return (
      <div 
        className={classNames("icon", name, { active })} 
        onClick={onClick} 
        ref={this.ref} 
      >
        <SvgIcon svg={svg}/>
      </div>
    );
  }
}

export class TileHeader extends React.Component<TileHeaderProps, TileHeaderState> {
  renderIcons() {
    const { icons } = this.props;
    if (!icons || !icons.length) return null;
    var iconElements = icons.map((icon, index) => <IconDiv key={index} {...icon}/>);
    return <div className="icons">{iconElements}</div>;
  }

  render() {
    const { title, onDragStart } = this.props;

    return <div className="tile-header" draggable={onDragStart ? true : null} onDragStart={onDragStart}>
      <div className="title">{title}</div>
      {this.renderIcons()}
    </div>;
  }
}
