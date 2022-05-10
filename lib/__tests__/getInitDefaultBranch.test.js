"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setupFixture_1 = require("../helpers/setupFixture");
const git_1 = require("../git");
describe("getDefaultBranch()", () => {
    afterAll(() => {
        (0, setupFixture_1.cleanupFixtures)();
    });
    it("is main in the default test repo", () => {
        // arrange
        const cwd = (0, setupFixture_1.setupFixture)("basic");
        // act
        const branch = (0, git_1.getDefaultBranch)(cwd);
        // assert
        expect(branch).toBe("main");
    });
    it("is myMain when default branch is different", () => {
        // arrange
        const cwd = (0, setupFixture_1.setupFixture)("basic");
        (0, git_1.git)(['config', 'init.defaultBranch', 'myMain'], { cwd });
        // act
        const branch = (0, git_1.getDefaultBranch)(cwd);
        // assert
        expect(branch).toBe("myMain");
    });
});
