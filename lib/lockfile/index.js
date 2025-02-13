"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryLockFile = exports.nameAtVersion = exports.parseLockFile = void 0;
// NOTE: never place the import of lockfile implementation here, as it slows down the library as a whole
const find_up_1 = __importDefault(require("find-up"));
const fs_1 = __importDefault(require("fs"));
const nameAtVersion_1 = require("./nameAtVersion");
Object.defineProperty(exports, "nameAtVersion", { enumerable: true, get: function () { return nameAtVersion_1.nameAtVersion; } });
const parsePnpmLock_1 = require("./parsePnpmLock");
const parseNpmLock_1 = require("./parseNpmLock");
const memoization = {};
async function parseLockFile(packageRoot) {
    const yarnLockPath = await (0, find_up_1.default)(["yarn.lock", "common/config/rush/yarn.lock"], { cwd: packageRoot });
    // First, test out whether this works for yarn
    if (yarnLockPath) {
        if (memoization[yarnLockPath]) {
            return memoization[yarnLockPath];
        }
        const parseYarnLock = (await Promise.resolve().then(() => __importStar(require("@yarnpkg/lockfile")))).parse;
        const yarnLock = fs_1.default.readFileSync(yarnLockPath, 'utf-8');
        const parsed = parseYarnLock(yarnLock);
        memoization[yarnLockPath] = parsed;
        return parsed;
    }
    // Second, test out whether this works for pnpm
    let pnpmLockPath = await (0, find_up_1.default)(["pnpm-lock.yaml", "common/config/rush/pnpm-lock.yaml"], { cwd: packageRoot });
    if (pnpmLockPath) {
        if (memoization[pnpmLockPath]) {
            return memoization[pnpmLockPath];
        }
        const readYamlFile = require("read-yaml-file");
        const yaml = (await readYamlFile(pnpmLockPath));
        const parsed = (0, parsePnpmLock_1.parsePnpmLock)(yaml);
        memoization[pnpmLockPath] = parsed;
        return memoization[pnpmLockPath];
    }
    // Third, try for npm workspaces
    let npmLockPath = await (0, find_up_1.default)(["package-lock.json"], { cwd: packageRoot });
    if (npmLockPath) {
        if (memoization[npmLockPath]) {
            return memoization[npmLockPath];
        }
        let npmLockJson;
        try {
            npmLockJson = fs_1.default.readFileSync(npmLockPath, 'utf-8');
        }
        catch (_a) {
            throw new Error("Couldn’t parse package-lock.json.");
        }
        const npmLock = JSON.parse(npmLockJson.toString());
        if (!(npmLock === null || npmLock === void 0 ? void 0 : npmLock.lockfileVersion) || npmLock.lockfileVersion < 2) {
            throw new Error(`Your package-lock.json version is not supported: lockfileVersion is ${npmLock.lockfileVersion}. You need npm version 7 or above and package-lock version 2 or above. Please, upgrade npm or choose a different package manager.`);
        }
        memoization[npmLockPath] = (0, parseNpmLock_1.parseNpmLock)(npmLock);
        return memoization[npmLockPath];
    }
    throw new Error("You do not have yarn.lock, pnpm-lock.yaml or package-lock.json. Please use one of these package managers.");
}
exports.parseLockFile = parseLockFile;
var queryLockFile_1 = require("./queryLockFile");
Object.defineProperty(exports, "queryLockFile", { enumerable: true, get: function () { return queryLockFile_1.queryLockFile; } });
__exportStar(require("./types"), exports);
