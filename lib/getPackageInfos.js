"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageInfos = void 0;
const fs_1 = __importDefault(require("fs"));
const infoFromPackageJson_1 = require("./infoFromPackageJson");
const workspaces_1 = require("./workspaces/workspaces");
function getPackageInfos(cwd) {
    const packageJsonFiles = (0, workspaces_1.getAllPackageJsonFiles)(cwd);
    const packageInfos = {};
    if (packageJsonFiles && packageJsonFiles.length > 0) {
        packageJsonFiles.forEach((packageJsonPath) => {
            try {
                const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf-8"));
                packageInfos[packageJson.name] = (0, infoFromPackageJson_1.infoFromPackageJson)(packageJson, packageJsonPath);
            }
            catch (e) {
                if (e instanceof Error) {
                    // Pass, the package.json is invalid
                    throw new Error(`Invalid package.json file detected ${packageJsonPath}: ${e.message}`);
                }
                else {
                    throw e;
                }
            }
        });
        return packageInfos;
    }
    return {};
}
exports.getPackageInfos = getPackageInfos;
