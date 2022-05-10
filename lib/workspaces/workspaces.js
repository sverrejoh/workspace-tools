"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._resetCache = exports.getAllPackageJsonFiles = void 0;
const getWorkspaces_1 = require("./getWorkspaces");
const cache = new Map();
/**
 * Get paths to every package.json in the workspace, given a cwd
 * @param cwd
 */
function getAllPackageJsonFiles(cwd) {
    if (cache.has(cwd)) {
        return cache.get(cwd);
    }
    const workspaces = (0, getWorkspaces_1.getWorkspaces)(cwd);
    const packageJsonFiles = workspaces.map((workspace) => workspace.packageJson.packageJsonPath);
    cache.set(cwd, packageJsonFiles);
    return packageJsonFiles;
}
exports.getAllPackageJsonFiles = getAllPackageJsonFiles;
function _resetCache() {
    cache.clear();
}
exports._resetCache = _resetCache;
