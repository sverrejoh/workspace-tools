"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceInfoFromWorkspaceRoot = exports.getPackageJsonWorkspaceRoot = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require(".");
const getPackagePaths_1 = require("../../getPackagePaths");
const getWorkspacePackageInfo_1 = require("../getWorkspacePackageInfo");
function getPackageJsonWorkspaceRoot(cwd) {
    var _a;
    const lockFile = (_a = (0, _1.getWorkspaceImplementationAndLockFile)(cwd)) === null || _a === void 0 ? void 0 : _a.lockFile;
    const packageJsonWorkspacesRoot = lockFile ? path_1.default.dirname(lockFile) : cwd;
    return packageJsonWorkspacesRoot;
}
exports.getPackageJsonWorkspaceRoot = getPackageJsonWorkspaceRoot;
function getRootPackageJson(packageJsonWorkspacesRoot) {
    const packageJsonFile = path_1.default.join(packageJsonWorkspacesRoot, "package.json");
    try {
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonFile, "utf-8"));
        return packageJson;
    }
    catch (e) {
        throw new Error("Could not load package.json from workspaces root");
    }
}
function getPackages(packageJson) {
    const { workspaces } = packageJson;
    if (workspaces && Array.isArray(workspaces)) {
        return workspaces;
    }
    if (!workspaces || !workspaces.packages) {
        throw new Error("Could not find a workspaces object in package.json");
    }
    return workspaces.packages;
}
function getWorkspaceInfoFromWorkspaceRoot(packageJsonWorkspacesRoot) {
    try {
        const rootPackageJson = getRootPackageJson(packageJsonWorkspacesRoot);
        const packages = getPackages(rootPackageJson);
        const packagePaths = (0, getPackagePaths_1.getPackagePaths)(packageJsonWorkspacesRoot, packages);
        const workspaceInfo = (0, getWorkspacePackageInfo_1.getWorkspacePackageInfo)(packagePaths);
        return workspaceInfo;
    }
    catch (_a) {
        return [];
    }
}
exports.getWorkspaceInfoFromWorkspaceRoot = getWorkspaceInfoFromWorkspaceRoot;
