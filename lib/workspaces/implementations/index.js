"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceImplementation = exports.getWorkspaceImplementationAndLockFile = void 0;
const find_up_1 = __importDefault(require("find-up"));
const path_1 = __importDefault(require("path"));
const workspaceCache = {};
function getWorkspaceImplementationAndLockFile(cwd, cache = workspaceCache) {
    if (cache[cwd]) {
        return cache[cwd];
    }
    const lockFile = find_up_1.default.sync(["lerna.json", "rush.json", "yarn.lock", "pnpm-workspace.yaml", "package-lock.json"], {
        cwd,
    });
    if (!lockFile) {
        return;
    }
    switch (path_1.default.basename(lockFile)) {
        case "lerna.json":
            cache[cwd] = {
                implementation: "lerna",
                lockFile,
            };
            break;
        case "yarn.lock":
            cache[cwd] = {
                implementation: "yarn",
                lockFile,
            };
            break;
        case "pnpm-workspace.yaml":
            cache[cwd] = {
                implementation: "pnpm",
                lockFile,
            };
            break;
        case "rush.json":
            cache[cwd] = {
                implementation: "rush",
                lockFile,
            };
            break;
        case "package-lock.json":
            cache[cwd] = {
                implementation: "npm",
                lockFile,
            };
            break;
    }
    return cache[cwd];
}
exports.getWorkspaceImplementationAndLockFile = getWorkspaceImplementationAndLockFile;
function getWorkspaceImplementation(cwd, cache = workspaceCache) {
    var _a;
    return (_a = getWorkspaceImplementationAndLockFile(cwd, cache)) === null || _a === void 0 ? void 0 : _a.implementation;
}
exports.getWorkspaceImplementation = getWorkspaceImplementation;
