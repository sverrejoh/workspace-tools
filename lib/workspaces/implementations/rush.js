"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRushWorkspaces = exports.getRushWorkspaceRoot = void 0;
const find_up_1 = __importDefault(require("find-up"));
const path_1 = __importDefault(require("path"));
const jju_1 = __importDefault(require("jju"));
const fs_1 = __importDefault(require("fs"));
const getWorkspacePackageInfo_1 = require("../getWorkspacePackageInfo");
function getRushWorkspaceRoot(cwd) {
    const rushJsonPath = find_up_1.default.sync("rush.json", { cwd });
    if (!rushJsonPath) {
        throw new Error("Could not find rush workspaces root");
    }
    return path_1.default.dirname(rushJsonPath);
}
exports.getRushWorkspaceRoot = getRushWorkspaceRoot;
function getRushWorkspaces(cwd) {
    try {
        const rushWorkspaceRoot = getRushWorkspaceRoot(cwd);
        const rushJsonPath = path_1.default.join(rushWorkspaceRoot, "rush.json");
        const rushConfig = jju_1.default.parse(fs_1.default.readFileSync(rushJsonPath, "utf-8"));
        const root = path_1.default.dirname(rushJsonPath);
        return (0, getWorkspacePackageInfo_1.getWorkspacePackageInfo)(rushConfig.projects.map((project) => path_1.default.join(root, project.projectFolder)));
    }
    catch (_a) {
        return [];
    }
}
exports.getRushWorkspaces = getRushWorkspaces;
