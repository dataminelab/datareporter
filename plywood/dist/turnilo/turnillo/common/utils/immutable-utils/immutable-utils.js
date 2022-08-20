"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeEquals = exports.isEqualable = exports.ImmutableUtils = void 0;
class ImmutableUtils {
    static setProperty(instance, path, newValue) {
        var bits = path.split(".");
        var lastObject = newValue;
        var currentObject;
        var getLastObject = () => {
            let o = instance;
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
            }
            else {
                let message = "Can't find \`change()\` method on " + currentObject.constructor.name;
                console.error(message); // Leaving this console statement because the error might be caught and obfuscated
                throw new Error(message);
            }
        }
        return lastObject;
    }
    static getProperty(instance, path) {
        var value = instance;
        var bits = path.split(".");
        var bit;
        while (bit = bits.shift())
            value = value[bit];
        return value;
    }
    static change(instance, propertyName, newValue) {
        var v = instance.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error(`Unknown property : ${propertyName}`);
        }
        v[propertyName] = newValue;
        return new instance.constructor(v);
    }
    static addInArray(instance, propertyName, newItem, index = -1) {
        var newArray = instance[propertyName];
        if (index === -1) {
            newArray.push(newItem);
        }
        else {
            newArray[index] = newItem;
        }
        return ImmutableUtils.change(instance, propertyName, newArray);
    }
}
exports.ImmutableUtils = ImmutableUtils;
function isEqualable(o) {
    return typeof o === "object" && typeof o.equals === "function";
}
exports.isEqualable = isEqualable;
function safeEquals(a, b) {
    if (isEqualable(a))
        return a.equals(b);
    return a === b;
}
exports.safeEquals = safeEquals;
//# sourceMappingURL=immutable-utils.js.map