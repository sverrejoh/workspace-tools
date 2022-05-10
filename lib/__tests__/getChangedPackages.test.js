"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const setupFixture_1 = require("../helpers/setupFixture");
const git_1 = require("../git");
const getChangedPackages_1 = require("../workspaces/getChangedPackages");
describe("getChangedPackages()", () => {
    afterAll(() => {
        (0, setupFixture_1.cleanupFixtures)();
    });
    it("can detect changes inside an untracked file", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toContain("package-a");
    });
    it("can detect changes inside an untracked file in a nested monorepo", () => {
        // arrange
        const root = path_1.default.join((0, setupFixture_1.setupFixture)("monorepo-nested"), "monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toEqual(["package-a"]);
    });
    it("can detect changes inside an unstaged file", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/src/index.ts");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toContain("package-a");
    });
    it("can detect changes inside an unstaged file in a nested monorepo", () => {
        // arrange
        const root = path_1.default.join((0, setupFixture_1.setupFixture)("monorepo-nested"), "monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/src/index.ts");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toEqual(["package-a"]);
    });
    it("can detect changes inside a staged file", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        (0, git_1.git)(["add", newFile], { cwd: root });
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toContain("package-a");
    });
    it("can detect changes inside a staged file in a nested monorepo", () => {
        // arrange
        const root = path_1.default.join((0, setupFixture_1.setupFixture)("monorepo-nested"), "monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        (0, git_1.git)(["add", newFile], { cwd: root });
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toEqual(["package-a"]);
    });
    it("can detect changes inside a file that has been committed in a different branch", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        (0, git_1.git)(["checkout", "-b", "newbranch"], { cwd: root });
        (0, git_1.stageAndCommit)(["add", newFile], "test commit", root);
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toContain("package-a");
    });
    it("can detect changes inside a file that has been committed in a different branch in a nested monorepo", () => {
        // arrange
        const root = path_1.default.join((0, setupFixture_1.setupFixture)("monorepo-nested"), "monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        (0, git_1.git)(["checkout", "-b", "newbranch"], { cwd: root });
        (0, git_1.stageAndCommit)(["add", newFile], "test commit", root);
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main");
        // assert
        expect(changedPkgs).toEqual(["package-a"]);
    });
    it("can detect changes inside a file that has been committed in a different branch using default remote", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        (0, setupFixture_1.setupLocalRemote)(root, "origin", "basic");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        (0, git_1.git)(["checkout", "-b", "newbranch"], { cwd: root });
        (0, git_1.stageAndCommit)(["add", newFile], "test commit", root);
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, undefined);
        // assert
        expect(changedPkgs).toContain("package-a");
    });
    it("can ignore glob patterns in detecting changes", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        (0, git_1.git)(["add", newFile], { cwd: root });
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackages)(root, "main", ["packages/package-a/*"]);
        // assert
        expect(changedPkgs).toEqual([]);
    });
    it("can detect changed packages between two refs", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        (0, git_1.git)(["add", newFile], { cwd: root });
        (0, git_1.stageAndCommit)(["packages/package-a/footest.txt"], "test commit in a", root);
        const newFile2 = path_1.default.join(root, "packages/package-b/footest2.txt");
        fs_1.default.writeFileSync(newFile2, "hello foo test");
        (0, git_1.git)(["add", newFile2], { cwd: root });
        (0, git_1.stageAndCommit)(["packages/package-b/footest2.txt"], "test commit in b", root);
        // act
        const changedPkgs = (0, getChangedPackages_1.getChangedPackagesBetweenRefs)(root, "HEAD^1", "HEAD");
        // assert
        expect(changedPkgs).toContain("package-b");
        expect(changedPkgs).not.toContain("package-a");
    });
});
