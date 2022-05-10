"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const setupFixture_1 = require("../helpers/setupFixture");
const getPackagesByFiles_1 = require("../workspaces/getPackagesByFiles");
describe("getPackagesByFiles()", () => {
    afterAll(() => {
        (0, setupFixture_1.cleanupFixtures)();
    });
    it("can find all packages that contain the files in a monorepo", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFile = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFile, "hello foo test");
        // act
        const packages = (0, getPackagesByFiles_1.getPackagesByFiles)(root, ["packages/package-a/footest.txt"]);
        // assert
        expect(packages).toContain("package-a");
        expect(packages).not.toContain("package-b");
    });
    it("can find can ignore changes in a glob pattern", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        const newFileA = path_1.default.join(root, "packages/package-a/footest.txt");
        fs_1.default.writeFileSync(newFileA, "hello foo test");
        const newFileB = path_1.default.join(root, "packages/package-b/footest.txt");
        fs_1.default.writeFileSync(newFileB, "hello foo test");
        // act
        const packages = (0, getPackagesByFiles_1.getPackagesByFiles)(root, ["packages/package-a/footest.txt", "packages/package-b/footest.txt"], ["packages/package-b/**"]);
        // assert
        expect(packages).toContain("package-a");
        expect(packages).not.toContain("package-b");
    });
    it("can find can handle empty files", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        // act
        const packages = (0, getPackagesByFiles_1.getPackagesByFiles)(root, []);
        // assert
        expect(packages.length).toBe(0);
    });
    it("can find can handle unrelated files", () => {
        // arrange
        const root = (0, setupFixture_1.setupFixture)("monorepo");
        // act
        const packages = (0, getPackagesByFiles_1.getPackagesByFiles)(root, ["package.json"]);
        // assert
        expect(packages.length).toBe(0);
    });
});
