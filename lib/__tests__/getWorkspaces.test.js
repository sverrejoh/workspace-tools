"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const setupFixture_1 = require("../helpers/setupFixture");
const implementations_1 = require("../workspaces/implementations");
const yarn_1 = require("../workspaces/implementations/yarn");
const pnpm_1 = require("../workspaces/implementations/pnpm");
const rush_1 = require("../workspaces/implementations/rush");
const npm_1 = require("../workspaces/implementations/npm");
const lerna_1 = require("../workspaces/implementations/lerna");
describe("getWorkspaces", () => {
    afterAll(() => {
        (0, setupFixture_1.cleanupFixtures)();
    });
    describe("yarn", () => {
        it("gets the name and path of the workspaces", () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("yarn");
            const workspacesPackageInfo = (0, yarn_1.getYarnWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
            ]);
        });
        it("gets the name and path of the workspaces against a packages spec of an individual package", () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo-globby");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("yarn");
            const workspacesPackageInfo = (0, yarn_1.getYarnWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            const individualPath = path_1.default.join(packageRoot, "packages", "individual");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "individual", path: individualPath },
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
            ]);
        });
    });
    describe("pnpm", () => {
        it("gets the name and path of the workspaces", () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo-pnpm");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("pnpm");
            const workspacesPackageInfo = (0, pnpm_1.getPnpmWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
            ]);
        });
    });
    describe("rush + pnpm", () => {
        it("gets the name and path of the workspaces", () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo-rush-pnpm");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("rush");
            const workspacesPackageInfo = (0, rush_1.getRushWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
            ]);
        });
    });
    describe("rush + yarn", () => {
        it("gets the name and path of the workspaces", () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo-rush-yarn");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("rush");
            const workspacesPackageInfo = (0, rush_1.getRushWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
            ]);
        });
    });
    describe("npm", () => {
        it("gets the name and path of the workspaces", () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo-npm");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("npm");
            const workspacesPackageInfo = (0, npm_1.getNpmWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
            ]);
        });
        it("gets the name and path of the workspaces using the shorthand configuration", () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo-shorthand");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("npm");
            const workspacesPackageInfo = (0, npm_1.getNpmWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            const individualPath = path_1.default.join(packageRoot, "individual");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
                { name: "individual", path: individualPath },
            ]);
        });
    });
    describe("lerna", () => {
        it("gets the name and path of the workspaces", async () => {
            const packageRoot = (0, setupFixture_1.setupFixture)("monorepo-lerna-npm");
            expect((0, implementations_1.getWorkspaceImplementation)(packageRoot, {})).toBe("lerna");
            const workspacesPackageInfo = (0, lerna_1.getLernaWorkspaces)(packageRoot);
            const packageAPath = path_1.default.join(packageRoot, "packages", "package-a");
            const packageBPath = path_1.default.join(packageRoot, "packages", "package-b");
            expect(workspacesPackageInfo).toMatchObject([
                { name: "package-a", path: packageAPath },
                { name: "package-b", path: packageBPath },
            ]);
        });
    });
});
