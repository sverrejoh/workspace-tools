"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackagePaths = void 0;
const path_1 = __importDefault(require("path"));
const globby_1 = __importDefault(require("globby"));
const packagePathsCache = {};
function getPackagePaths(workspacesRoot, packages) {
    if (packagePathsCache[workspacesRoot]) {
        return packagePathsCache[workspacesRoot];
    }
    const packagePaths = globby_1.default
        .sync(packages.map((glob) => path_1.default.join(glob, "package.json").replace(/\\/g, "/")), {
        cwd: workspacesRoot,
        absolute: true,
        ignore: ["**/node_modules/**"],
        stats: false,
    })
        .map((p) => path_1.default.dirname(p));
    if (path_1.default.sep === "/") {
        packagePathsCache[workspacesRoot] = packagePaths;
    }
    else {
        packagePathsCache[workspacesRoot] = packagePaths.map((p) => p.replace(/\//g, path_1.default.sep));
    }
    return packagePathsCache[workspacesRoot];
}
exports.getPackagePaths = getPackagePaths;
