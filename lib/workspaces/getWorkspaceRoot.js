"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceRoot = void 0;
const implementations_1 = require("./implementations");
const preferred = process.env.PREFERRED_WORKSPACE_MANAGER;
function getWorkspaceRoot(cwd) {
    const workspaceImplementation = preferred || (0, implementations_1.getWorkspaceImplementation)(cwd);
    if (!workspaceImplementation) {
        return;
    }
    switch (workspaceImplementation) {
        case "yarn":
            return require(`./implementations/yarn`).getYarnWorkspaceRoot(cwd);
        case "pnpm":
            return require(`./implementations/pnpm`).getPnpmWorkspaceRoot(cwd);
        case "rush":
            return require(`./implementations/rush`).getRushWorkspaceRoot(cwd);
        case "npm":
            return require(`./implementations/npm`).getNpmWorkspaceRoot(cwd);
        case "lerna":
            return require(`./implementations/lerna`).getLernaWorkspaceRoot(cwd);
    }
}
exports.getWorkspaceRoot = getWorkspaceRoot;
