"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYarnWorkspaces = exports.getYarnWorkspaceRoot = void 0;
const packageJsonWorkspaces_1 = require("./packageJsonWorkspaces");
function getYarnWorkspaceRoot(cwd) {
    const yarnWorkspacesRoot = (0, packageJsonWorkspaces_1.getPackageJsonWorkspaceRoot)(cwd);
    if (!yarnWorkspacesRoot) {
        throw new Error("Could not find yarn workspaces root");
    }
    return yarnWorkspacesRoot;
}
exports.getYarnWorkspaceRoot = getYarnWorkspaceRoot;
function getYarnWorkspaces(cwd) {
    const yarnWorkspacesRoot = getYarnWorkspaceRoot(cwd);
    return (0, packageJsonWorkspaces_1.getWorkspaceInfoFromWorkspaceRoot)(yarnWorkspacesRoot);
}
exports.getYarnWorkspaces = getYarnWorkspaces;
