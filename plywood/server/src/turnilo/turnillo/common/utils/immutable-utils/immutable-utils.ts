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
import { Record } from "immutable";
import { Equalable } from "immutable-class";

export class ImmutableUtils {
  public static setProperty(instance: any, path: string, newValue: any): any {
    var bits = path.split(".");
    var lastObject = newValue;
    var currentObject: any;

    var getLastObject = () => {
      let o: any = instance;

      for (const bit of bits) {
        o = o[bit];
      }

      return o;
    };

    while (bits.length) {
      let bit = bits.pop();

      currentObject = getLastObject();
      if (currentObject.change instanceof Function) {
        lastObject = currentObject.change(bit, lastObject);
      } else {
        let message = "Can't find \`change()\` method on " + currentObject.constructor.name;
        console.error(message); // Leaving this console statement because the error might be caught and obfuscated
        throw new Error(message);
      }
    }

    return lastObject;
  }

  public static getProperty(instance: any, path: string): any {
    var value = instance;
    var bits = path.split(".");
    var bit: string;
    while (bit = bits.shift()) value = value[bit];

    return value as any;
  }

  public static change<T>(instance: T, propertyName: string, newValue: any): T {
    var v = instance.valueOf();

    if (!v.hasOwnProperty(propertyName)) {
      throw new Error(`Unknown property : ${propertyName}`);
    }

    (v as any)[propertyName] = newValue;
    return new (instance as any).constructor(v);
  }

  public static addInArray<T>(instance: T, propertyName: string, newItem: any, index = -1): T {
    var newArray = (instance as any)[propertyName];

    if (index === -1) {
      newArray.push(newItem);
    } else {
      newArray[index] = newItem;
    }

    return ImmutableUtils.change(instance, propertyName, newArray);
  }
}
//@ts-ignore
export type ImmutableRecord<T> = Record<T> & Readonly<T>;

export function isEqualable(o: unknown): o is Equalable {
  return typeof o === "object" && typeof (o as Equalable).equals === "function";
}

export function safeEquals(a: unknown, b: unknown): boolean {
  if (isEqualable(a)) return a.equals(b);
  return a === b;
}
