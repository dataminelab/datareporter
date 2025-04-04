/*
 * Copyright 2017-2018 Allegro.pl
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

import * as d3 from "d3";
import { Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { classNames } from "../../../../utils/dom/dom";
import "./measure-row.scss";
import { MeasureValue } from "./measure-value";

interface MeasureRowProps {
  essence: Essence;
  highlight: boolean;
  dimmed: boolean;
  style: React.CSSProperties;
  datum: Datum;
  cellWidth: number;
  report: any;
  scales: Array<d3.ScaleLinear<number, number>>;
}

export const MeasureRow: React.SFC<MeasureRowProps> = props => {
  const { datum, scales, cellWidth, highlight, dimmed, style, essence, report } = props;
  const concreteSeries = essence.getConcreteSeries().toArray();
  const splitLength = essence.splits.length();

  return <div
    className={classNames("measure-row", { highlight, dimmed })}
    style={style}
  >
    {concreteSeries.map((series, i) => {
      return <MeasureValue
        key={series.reactKey()}
        series={series}
        report={report}
        datum={datum}
        highlight={highlight}
        scale={scales[i]}
        cellWidth={cellWidth}
        lastLevel={datum["__nest"] === splitLength}
        showPrevious={essence.hasComparison()} />;
    })}
  </div>;
};
