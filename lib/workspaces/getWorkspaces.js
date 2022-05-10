"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaces = void 0;
const implementations_1 = require("./implementations");
const preferred = process.env.PREFERRED_WORKSPACE_MANAGER;
function getWorkspaces(cwd) {
    const workspaceImplementation = preferred || (0, implementations_1.getWorkspaceImplementation)(cwd);
    if (!workspaceImplementation) {
        return [];
    }
    switch (workspaceImplementation) {
        case "yarn":
            return require(`./implementations/yarn`).getYarnWorkspaces(cwd);
        case "pnpm":
            return require(`./implementations/pnpm`).getPnpmWorkspaces(cwd);
        case "rush":
            return require(`./implementations/rush`).getRushWorkspaces(cwd);
        case "npm":
            return require(`./implementations/npm`).getNpmWorkspaces(cwd);
        case "lerna":
            return require(`./implementations/lerna`).getLernaWorkspaces(cwd);
    }
}
exports.getWorkspaces = getWorkspaces;
