import path from "path";
import findUp from "find-up";
import fs from "fs-extra";
import tmp from "tmp";
import { init, stageAndCommit } from "../git";

// tmp is supposed to be able to clean up automatically, but this doesn't always work within jest.
// So we attempt to use its built-in cleanup mechanisms, but tests should ideally do their own cleanup too.
tmp.setGracefulCleanup();

let fixturesRoot: string | undefined;
// Temp directories are created under tempRoot.name with incrementing numeric sub-directories
let tempRoot: tmp.DirResult | undefined;
let tempNumber = 0;

/**
 * Create a temp directory containing a git repo. If `fixtureName` is given, the contents of that
 * fixture will be copied into the temp repo folder and committed.
 *
 * Be sure to call `cleanupFixtures()` after all tests to clean up temp directories.
 */
export function setupFixture(fixtureName?: string) {
  if (!tempRoot) {
    // Create a shared root temp directory for fixture files
    tempRoot = tmp.dirSync({ unsafeCleanup: true }); // clean up even if files are left
  }

  // Make the directory and git init
  const cwd = path.join(tempRoot.name, String(tempNumber++), fixtureName || "");
  fs.mkdirpSync(cwd);
  init(cwd, "test@test.email", "test user");

  // Copy and commit the fixture if requested
  if (fixtureName) {
    if (!fixturesRoot) {
      fixturesRoot = findUp.sync("__fixtures__", { cwd: __dirname, type: "directory" });
    }

    const fixturePath = path.join(fixturesRoot!, fixtureName);
    if (!fs.existsSync(fixturePath)) {
      throw new Error(`Couldn't find fixture "${fixtureName}" under "${fixturesRoot}"`);
    }

    fs.copySync(fixturePath, cwd);
    stageAndCommit(["."], "test", cwd);
  }

  return cwd;
}

export function cleanupFixtures() {
  if (tempRoot) {
    tempRoot.removeCallback();
    tempRoot = undefined;
  }
}
