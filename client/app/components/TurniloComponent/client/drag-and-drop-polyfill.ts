/*
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
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export default function dragAndDropPolyfill() {
  const div = document.createElement("div");
  const dragDiv = "draggable" in div;
  const evts = "ondragstart" in div && "ondrop" in div;

  const needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

  if (needsPatch) {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      import("../lib/polyfill/drag-drop-polyfill.min.js"),
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      import("../lib/polyfill/drag-drop-polyfill.css")
    ]).then(([DragDropPolyfill, _]) => {
      DragDropPolyfill.Initialize({});
    });
  }
}
