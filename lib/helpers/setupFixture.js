"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLocalRemote = exports.cleanupFixtures = exports.setupFixture = void 0;
const path_1 = __importDefault(require("path"));
const find_up_1 = __importDefault(require("find-up"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const git_1 = require("../git");
// tmp is supposed to be able to clean up automatically, but this doesn't always work within jest.
// So we attempt to use its built-in cleanup mechanisms, but tests should ideally do their own cleanup too.
tmp_1.default.setGracefulCleanup();
let fixturesRoot;
let tempRoot;
let tempNumber = 0;
/**
 * Create a temp directory containing the given fixture name in a git repo.
 * Be sure to call `cleanupFixtures()` after all tests to clean up temp directories.
 */
function setupFixture(fixtureName) {
    if (!fixturesRoot) {
        fixturesRoot = find_up_1.default.sync("__fixtures__", { cwd: __dirname, type: "directory" });
    }
    const fixturePath = path_1.default.join(fixturesRoot, fixtureName);
    if (!fs_extra_1.default.existsSync(fixturePath)) {
        throw new Error(`Couldn't find fixture "${fixtureName}" under "${fixturesRoot}"`);
    }
    if (!tempRoot) {
        // Create a shared root temp directory for fixture files
        tempRoot = tmp_1.default.dirSync({ unsafeCleanup: true }); // clean up even if files are left
    }
    const cwd = path_1.default.join(tempRoot.name, String(tempNumber++), fixtureName);
    fs_extra_1.default.mkdirpSync(cwd);
    fs_extra_1.default.copySync(fixturePath, cwd);
    (0, git_1.init)(cwd, "test@test.email", "test user");
    // Ensure GPG signing doesn't interfere with tests
    (0, git_1.gitFailFast)(["config", "commit.gpgsign", "false"], { cwd });
    // Make the 'main' branch the default in the test repo
    // ensure that the configuration for this repo does not collide
    // with any global configuration the user had made, so we have
    // a 'fixed' value for our tests, regardless of user configuration
    (0, git_1.gitFailFast)(["symbolic-ref", "HEAD", "refs/heads/main"], { cwd });
    (0, git_1.gitFailFast)(["config", "init.defaultBranch", "main"], { cwd });
    (0, git_1.stageAndCommit)(["."], "test", cwd);
    return cwd;
}
exports.setupFixture = setupFixture;
function cleanupFixtures() {
    if (tempRoot) {
        tempRoot.removeCallback();
        tempRoot = undefined;
    }
}
exports.cleanupFixtures = cleanupFixtures;
function setupLocalRemote(cwd, remoteName, fixtureName) {
    // Create a seperate repo and configure it as a remote
    const remoteCwd = setupFixture(fixtureName);
    const remoteUrl = remoteCwd.replace(/\\/g, "/");
    (0, git_1.gitFailFast)(["remote", "add", remoteName, remoteUrl], { cwd });
    // Configure url in package.json
    const pkgJsonPath = path_1.default.join(cwd, "package.json");
    const pkgJson = JSON.parse(fs_extra_1.default.readFileSync(pkgJsonPath, "utf-8"));
    fs_extra_1.default.writeFileSync(pkgJsonPath, JSON.stringify(Object.assign(Object.assign({}, pkgJson), { repository: {
            url: remoteUrl,
        } }), null, 2));
}
exports.setupLocalRemote = setupLocalRemote;
