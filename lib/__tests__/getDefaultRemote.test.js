"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setupFixture_1 = require("../helpers/setupFixture");
const git_1 = require("../git");
describe("getDefaultRemote()", () => {
    afterAll(() => {
        (0, setupFixture_1.cleanupFixtures)();
    });
    it("is origin in the default test repo", () => {
        // arrange
        const cwd = (0, setupFixture_1.setupFixture)("basic");
        // act
        const remote = (0, git_1.getDefaultRemote)(cwd);
        // assert
        expect(remote).toBe("origin");
    });
    it("is myMain when default branch is different", () => {
        // arrange
        const cwd = (0, setupFixture_1.setupFixture)("basic");
        (0, setupFixture_1.setupLocalRemote)(cwd, "myRemote", "basic");
        // act
        const remote = (0, git_1.getDefaultRemote)(cwd);
        // assert
        expect(remote).toBe("myRemote");
    });
});
