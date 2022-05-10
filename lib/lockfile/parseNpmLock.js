"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNpmLock = void 0;
const nameAtVersion_1 = require("./nameAtVersion");
/**
 * formatNpmLock reformats the dependencies object, so the key includes the version, similarly to yarn.lock. For
 * example, `"@microsoft/task-scheduler": { }` will become `"@microsoft/task-scheduler@2.7.1": { }`.
 */
const formatNpmLock = (previousValue, currentValue) => {
    const [key, dependency] = currentValue;
    previousValue[(0, nameAtVersion_1.nameAtVersion)(key, dependency.version)] = dependency;
    return previousValue;
};
const parseNpmLock = (lock) => {
    var _a;
    const dependencies = Object.entries((_a = lock.dependencies) !== null && _a !== void 0 ? _a : {}).reduce(formatNpmLock, {});
    return {
        object: dependencies,
        type: "success",
    };
};
exports.parseNpmLock = parseNpmLock;
