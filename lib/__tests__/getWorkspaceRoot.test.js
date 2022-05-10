"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setupFixture_1 = require("../helpers/setupFixture");
const yarn_1 = require("../workspaces/implementations/yarn");
const pnpm_1 = require("../workspaces/implementations/pnpm");
const rush_1 = require("../workspaces/implementations/rush");
const npm_1 = require("../workspaces/implementations/npm");
const lerna_1 = require("../workspaces/implementations/lerna");
describe("getWorkspaceRoot", () => {
    afterAll(() => {
        (0, setupFixture_1.cleanupFixtures)();
    });
    it("handles yarn workspace", () => {
        const repoRoot = (0, setupFixture_1.setupFixture)("monorepo");
        const workspaceRoot = (0, yarn_1.getYarnWorkspaceRoot)(repoRoot);
        expect(workspaceRoot).toBe(repoRoot);
    });
    it("handles pnpm workspace", () => {
        const repoRoot = (0, setupFixture_1.setupFixture)("monorepo-pnpm");
        const workspaceRoot = (0, pnpm_1.getPnpmWorkspaceRoot)(repoRoot);
        expect(workspaceRoot).toBe(repoRoot);
    });
    it("handles rush workspace", () => {
        const repoRoot = (0, setupFixture_1.setupFixture)("monorepo-rush-pnpm");
        const workspaceRoot = (0, rush_1.getRushWorkspaceRoot)(repoRoot);
        expect(workspaceRoot).toBe(repoRoot);
    });
    it("handles npm workspace", () => {
        const repoRoot = (0, setupFixture_1.setupFixture)("monorepo-npm");
        const workspaceRoot = (0, npm_1.getNpmWorkspaceRoot)(repoRoot);
        expect(workspaceRoot).toBe(repoRoot);
    });
});
describe("getLernaWorkspaceRoot()", () => {
    it("gets the root of the workspace", async () => {
        const repoRoot = await (0, setupFixture_1.setupFixture)("monorepo-lerna-npm");
        const workspaceRoot = (0, lerna_1.getLernaWorkspaceRoot)(repoRoot);
        expect(workspaceRoot).toBe(repoRoot);
    });
});
