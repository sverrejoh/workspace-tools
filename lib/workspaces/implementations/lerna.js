"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLernaWorkspaces = exports.getLernaWorkspaceRoot = void 0;
const find_up_1 = __importDefault(require("find-up"));
const fs_1 = __importDefault(require("fs"));
const jju_1 = __importDefault(require("jju"));
const path_1 = __importDefault(require("path"));
const getPackagePaths_1 = require("../../getPackagePaths");
const getWorkspacePackageInfo_1 = require("../getWorkspacePackageInfo");
function getLernaWorkspaceRoot(cwd) {
    const lernaJsonPath = find_up_1.default.sync("lerna.json", { cwd });
    if (!lernaJsonPath) {
        throw new Error("Could not find lerna workspace root");
    }
    return path_1.default.dirname(lernaJsonPath);
}
exports.getLernaWorkspaceRoot = getLernaWorkspaceRoot;
function getLernaWorkspaces(cwd) {
    try {
        const lernaWorkspaceRoot = getLernaWorkspaceRoot(cwd);
        const lernaJsonPath = path_1.default.join(lernaWorkspaceRoot, "lerna.json");
        const lernaConfig = jju_1.default.parse(fs_1.default.readFileSync(lernaJsonPath, "utf-8"));
        const packagePaths = (0, getPackagePaths_1.getPackagePaths)(lernaWorkspaceRoot, lernaConfig.packages);
        const workspaceInfo = (0, getWorkspacePackageInfo_1.getWorkspacePackageInfo)(packagePaths);
        return workspaceInfo;
    }
    catch (_a) {
        return [];
    }
}
exports.getLernaWorkspaces = getLernaWorkspaces;
