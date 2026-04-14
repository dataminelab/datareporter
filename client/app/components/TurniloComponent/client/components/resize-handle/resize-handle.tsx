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

import React from "react";
import { isFunction } from "util";
import { clamp, classNames, getXFromEvent, getYFromEvent } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./resize-handle.scss";

export enum Direction { LEFT = "left", RIGHT = "right", TOP = "top", BOTTOM = "bottom" }

export interface ResizeHandleProps {
  direction: Direction;
  min: number;
  max: number;
  value: number;
  onResize?: (newValue: number) => void;
  onResizeEnd?: () => void;
}

export interface ResizeHandleState {
  anchor?: number;
}

export const DragHandle = (): React.ReactElement => <SvgIcon svg={require("../../icons/drag-handle.svg")} />;

export class ResizeHandle extends React.Component<ResizeHandleProps, ResizeHandleState> {
  state: ResizeHandleState = {};

  private currentHandleElement: HTMLDivElement | null = null;
  private currentParentElement: HTMLElement | null = null;

  onMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;

    window.addEventListener("mouseup", this.onGlobalMouseUp);
    window.addEventListener("mousemove", this.onGlobalMouseMove);

    const handleElement = event.currentTarget; // The div with className="resize-handle"
    const parentElement = handleElement.offsetParent; // The positioned ancestor (e.g., .dimension-measure-panel--container)

    if (!parentElement) {
      console.warn("ResizeHandle: No offsetParent found. Cannot calculate relative position.");
      return;
    }

    this.currentHandleElement = handleElement;
    this.currentParentElement = parentElement as HTMLElement; // Cast to HTMLElement for safety

    const handleRect = handleElement.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();

    let dragOffset: number;

    switch (this.props.direction) {
      case Direction.LEFT:
        // Distance from parent's left to mouse. Then subtract handle's left-to-parent offset.
        dragOffset = (event.clientX - parentRect.left) - (handleRect.left - parentRect.left);
        break;
      case Direction.RIGHT:
        // Distance from parent's right to mouse. Then subtract handle's right-to-parent offset.
        dragOffset = (parentRect.right - event.clientX) - (parentRect.right - handleRect.right);
        break;
      case Direction.TOP:
        // Distance from handle's top edge to the mouse cursor, in viewport coordinates.
        dragOffset = event.clientY - handleRect.top;
        break;
      case Direction.BOTTOM:
        // Distance from handle's bottom edge to the mouse cursor, in viewport coordinates.
        dragOffset = handleRect.bottom - event.clientY;
        break;
      default:
        dragOffset = 0;
    }

    this.setState({
      anchor: dragOffset
    });

    event.preventDefault();
  };

  onGlobalMouseUp = (): void => {
    window.removeEventListener("mouseup", this.onGlobalMouseUp);
    window.removeEventListener("mousemove", this.onGlobalMouseMove);

    this.currentHandleElement = null;
    this.currentParentElement = null;

    if (isFunction(this.props.onResizeEnd)) {
      this.props.onResizeEnd();
    }
  };

  onGlobalMouseMove = (event: MouseEvent): void => {
    const { anchor } = this.state;
    if (anchor === undefined) return;

    const handleElement = this.currentHandleElement;
    const parentElement = this.currentParentElement;

    if (!handleElement || !parentElement) {
      console.warn("ResizeHandle: Missing element references during mousemove. Dragging aborted.");
      this.onGlobalMouseUp();
      return;
    }

    const parentRect = parentElement.getBoundingClientRect(); // Get fresh rect for accurate parent position

    let newPositionValue: number;

    switch (this.props.direction) {
      case Direction.LEFT:
        // Current mouse X relative to parent's left, minus the drag offset.
        newPositionValue = (event.clientX - parentRect.left) - anchor;
        break;
      case Direction.RIGHT:
        // Current mouse X relative to parent's right, minus the drag offset.
        newPositionValue = (parentRect.right - event.clientX) - anchor;
        break;
      case Direction.TOP:
        // Mouse Y relative to parent's top, minus the drag offset (distance from handle's top to mouse click point)
        newPositionValue = (event.clientY - parentRect.top) - anchor;
        break;
      case Direction.BOTTOM:
        // Mouse Y relative to parent's bottom, minus the drag offset (distance from handle's bottom to mouse click point)
        newPositionValue = (parentRect.bottom - event.clientY) - anchor;
        break;
      default:
        newPositionValue = 0;
    }

    const constrainedNewValue = this.constrainValue(newPositionValue);

    if (this.props.onResize) {
      this.props.onResize(constrainedNewValue);
    }
  };

  private getValue(event: MouseEvent | React.MouseEvent<HTMLElement>): number {
    return this.constrainValue(this.getCoordinate(event));
  }

  private getCoordinate(event: MouseEvent | React.MouseEvent<HTMLElement>): number {
    switch (this.props.direction) {
      case Direction.LEFT:
        return getXFromEvent(event);
      case Direction.RIGHT:
        return window.innerWidth - getXFromEvent(event);
      case Direction.TOP:
        return getYFromEvent(event);
      case Direction.BOTTOM:
        return window.innerHeight - getYFromEvent(event);
    }
  }

  private constrainValue(value: number): number {
    return clamp(value, this.props.min, this.props.max);
  }

  render(): React.ReactElement {
    const { direction, children, value } = this.props;

    const style: React.CSSProperties = {
      [direction]: value
    };

    return <div
      className={classNames("resize-handle", direction)}
      style={style}
      onMouseDown={this.onMouseDown}
    >
      {children}
    </div>;
  }
}
