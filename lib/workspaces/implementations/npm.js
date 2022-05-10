"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNpmWorkspaces = exports.getNpmWorkspaceRoot = void 0;
const packageJsonWorkspaces_1 = require("./packageJsonWorkspaces");
function getNpmWorkspaceRoot(cwd) {
    const npmWorkspacesRoot = (0, packageJsonWorkspaces_1.getPackageJsonWorkspaceRoot)(cwd);
    if (!npmWorkspacesRoot) {
        throw new Error("Could not find NPM workspaces root");
    }
    return npmWorkspacesRoot;
}
exports.getNpmWorkspaceRoot = getNpmWorkspaceRoot;
function getNpmWorkspaces(cwd) {
    const npmWorkspacesRoot = getNpmWorkspaceRoot(cwd);
    return (0, packageJsonWorkspaces_1.getWorkspaceInfoFromWorkspaceRoot)(npmWorkspacesRoot);
}
exports.getNpmWorkspaces = getNpmWorkspaces;
