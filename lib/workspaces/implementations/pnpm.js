"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPnpmWorkspaces = exports.getPnpmWorkspaceRoot = void 0;
const path_1 = __importDefault(require("path"));
const find_up_1 = __importDefault(require("find-up"));
const getPackagePaths_1 = require("../../getPackagePaths");
const getWorkspacePackageInfo_1 = require("../getWorkspacePackageInfo");
function getPnpmWorkspaceRoot(cwd) {
    const pnpmWorkspacesFile = find_up_1.default.sync("pnpm-workspace.yaml", { cwd });
    if (!pnpmWorkspacesFile) {
        throw new Error("Could not find pnpm workspaces root");
    }
    return path_1.default.dirname(pnpmWorkspacesFile);
}
exports.getPnpmWorkspaceRoot = getPnpmWorkspaceRoot;
function getPnpmWorkspaces(cwd) {
    try {
        const pnpmWorkspacesRoot = getPnpmWorkspaceRoot(cwd);
        const pnpmWorkspacesFile = path_1.default.join(pnpmWorkspacesRoot, "pnpm-workspace.yaml");
        const readYaml = require("read-yaml-file").sync;
        const pnpmWorkspaces = readYaml(pnpmWorkspacesFile);
        const packagePaths = (0, getPackagePaths_1.getPackagePaths)(pnpmWorkspacesRoot, pnpmWorkspaces.packages);
        const workspaceInfo = (0, getWorkspacePackageInfo_1.getWorkspacePackageInfo)(packagePaths);
        return workspaceInfo;
    }
    catch (_a) {
        return [];
    }
}
exports.getPnpmWorkspaces = getPnpmWorkspaces;
