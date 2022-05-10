"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWorkspacePath = void 0;
function findWorkspacePath(workspaces, packageName) {
    const workspace = workspaces.find(({ name }) => name === packageName);
    if (workspace) {
        return workspace.path;
    }
}
exports.findWorkspacePath = findWorkspacePath;
