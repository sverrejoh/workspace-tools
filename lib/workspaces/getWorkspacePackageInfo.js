"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspacePackageInfo = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getWorkspacePackageInfo(workspacePaths) {
    if (!workspacePaths) {
        return [];
    }
    return workspacePaths.reduce((returnValue, workspacePath) => {
        let packageJson;
        const packageJsonPath = path_1.default.join(workspacePath, "package.json");
        try {
            packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf-8"));
        }
        catch (_a) {
            return returnValue;
        }
        return [
            ...returnValue,
            {
                name: packageJson.name,
                path: workspacePath,
                packageJson: Object.assign(Object.assign({}, packageJson), { packageJsonPath }),
            },
        ];
    }, []);
}
exports.getWorkspacePackageInfo = getWorkspacePackageInfo;
