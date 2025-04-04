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

import { Ternary } from "../../utils/functional/functional";

import { Instance } from "immutable-class";
import { Binary } from "../../utils/functional/functional";

export interface UrlShortenerContext {
  clientIp: string;
}

export type UrlShortenerRef = Ternary<any, string, UrlShortenerContext, Promise<string>>;
export type UrlShortenerDefSQ = string;

export function fromConfig(definition?: UrlShortenerDefSQ): UrlShortenerRef | undefined {
  return definition && Function("request", "url", "context", definition) as UrlShortenerRef;
}



export type UrlShortenerFn = Binary<string, any, Promise<string>>;
export type UrlShortenerDef = string;

export class UrlShortener implements Instance<UrlShortenerDef, UrlShortenerDef> {

  static fromJS(definition: UrlShortenerDef): UrlShortener {
    return new UrlShortener(definition);
  }

  public readonly shortenerFunction: UrlShortenerFn;

  constructor(private shortenerDefinition: string) {
    this.shortenerFunction = new Function("url", "request", shortenerDefinition) as UrlShortenerFn;
  }

  public toJS(): UrlShortenerDef {
    return this.shortenerDefinition;
  }

  public valueOf(): UrlShortenerDef {
    return this.shortenerDefinition;
  }

  public toJSON(): UrlShortenerDef {
    return this.toJS();
  }

  public equals(other: UrlShortener): boolean {
    return other instanceof UrlShortener && this.valueOf() === other.valueOf();
  }

  public toString(): string {
    return this.shortenerDefinition;
  }
}
