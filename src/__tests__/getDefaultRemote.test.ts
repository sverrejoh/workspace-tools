import fs from "fs-extra";
import path from "path";
import os from "os";
import { git } from "../git";
import { getDefaultRemote } from "../git";
import { cleanupFixtures, setupFixture } from "../helpers/setupFixture";

describe("getDefaultRemote", () => {
  let root: string;
  let consoleMock: jest.SpyInstance;

  function gitRemote(...args: string[]) {
    const result = git(["remote", ...args], { cwd: root! });
    if (!result.success) {
      throw new Error(`Command "git remote ${args.join(" ")}" failed with:\n${result.stderr}`);
    }
  }

  function expectConsole(n: number, message: string) {
    expect(consoleMock.mock.calls[n - 1].join(" ")).toMatch(message);
  }

  function setupPackageFixture(packageJson: { repository?: string | { url: string } }) {
    root = setupFixture();
    writePackageJson(packageJson);
  }

  function writePackageJson(packageJson: { repository?: string | { url: string } }) {
    fs.writeJSONSync(path.join(root, "package.json"), packageJson, { spaces: 2 });
  }

  beforeAll(() => {
    consoleMock = jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleMock.mockReset();
  });

  afterAll(() => {
    consoleMock.mockRestore();
    cleanupFixtures();
  });

  it("throws if not in a git repo", () => {
    // hopefully os.tmpdir() is never under a git repo...?
    expect(() => getDefaultRemote(os.tmpdir())).toThrow("does not appear to be in a git repository");
    expect(() => getDefaultRemote(os.tmpdir(), true)).toThrow("does not appear to be in a git repository");
  });

  it("throws if package.json not found", () => {
    root = setupFixture();
    expect(() => getDefaultRemote(root!)).toThrow("Could not read");
    expect(() => getDefaultRemote(root!, true)).toThrow("Could not read");
  });

  it("(permissive) defaults to origin without repository field or remotes", () => {
    setupPackageFixture({});

    expect(getDefaultRemote(root)).toBe("origin");
    expectConsole(1, 'Valid "repository" key not found');
    expectConsole(2, "Could not find any remotes in git repo");
    expectConsole(3, 'Assuming default remote "origin".');
  });

  it("(strict) throws without repository field or remotes", () => {
    setupPackageFixture({});

    expect(() => getDefaultRemote(root!, true)).toThrow("Could not find any remotes");
  });

  it("defaults to upstream remote without repository field", () => {
    setupPackageFixture({});
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "origin", "https://github.com/ecraig12345/workspace-tools.git");
    gitRemote("add", "upstream", "https://github.com/microsoft/workspace-tools.git");

    expect(getDefaultRemote(root)).toBe("upstream");
    expectConsole(1, 'Valid "repository" key not found');
    expectConsole(2, 'Default to remote "upstream"');

    expect(getDefaultRemote(root, true)).toBe("upstream");
    expectConsole(3, 'Valid "repository" key not found');
    expectConsole(4, 'Default to remote "upstream"');
  });

  it("defaults to origin remote without repository field or upstream remote", () => {
    setupPackageFixture({});
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "origin", "https://github.com/microsoft/workspace-tools.git");

    expect(getDefaultRemote(root)).toBe("origin");
    expectConsole(1, 'Valid "repository" key not found');
    expectConsole(2, 'Default to remote "origin"');

    expect(getDefaultRemote(root, true)).toBe("origin");
    expectConsole(3, 'Valid "repository" key not found');
    expectConsole(4, 'Default to remote "origin"');
  });

  it("defaults to first remote without repository field, origin, or upstream", () => {
    setupPackageFixture({});
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "second", "https://github.com/microsoft/workspace-tools.git");

    expect(getDefaultRemote(root)).toBe("first");
    expectConsole(1, 'Valid "repository" key not found');
    expectConsole(2, 'Default to remote "first"');

    expect(getDefaultRemote(root, true)).toBe("first");
    expectConsole(3, 'Valid "repository" key not found');
    expectConsole(4, 'Default to remote "first"');
  });

  it("finds remote matching repository string", () => {
    setupPackageFixture({ repository: "https://github.com/microsoft/workspace-tools.git" });
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "second", "https://github.com/microsoft/workspace-tools.git");

    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");
  });

  it("finds remote matching repository object", () => {
    setupPackageFixture({ repository: { url: "https://github.com/microsoft/workspace-tools.git" } });
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "second", "https://github.com/microsoft/workspace-tools.git");

    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");
  });

  it("(permissive) defaults to origin if no remotes set and repository specified", () => {
    setupPackageFixture({ repository: { url: "https://github.com/baz/some-repo" } });

    expect(getDefaultRemote(root)).toBe("origin");
    expectConsole(1, "Could not find remote pointing to");
    expectConsole(2, "Could not find any remotes in git repo");
    expectConsole(3, 'Assuming default remote "origin".');
  });

  it("(permissive) defaults to first remote if none matches repository", () => {
    setupPackageFixture({ repository: { url: "https://github.com/ecraig12345/some-repo" } });
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "second", "https://github.com/microsoft/workspace-tools.git");

    expect(getDefaultRemote(root)).toBe("first");
    expectConsole(1, "Could not find remote pointing to repository");
  });

  it("(strict) throws if no remote matches repository", () => {
    setupPackageFixture({ repository: { url: "https://github.com/ecraig12345/some-repo" } });
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "second", "https://github.com/microsoft/workspace-tools.git");

    expect(() => getDefaultRemote(root!, true)).toThrow("Could not find remote pointing to repository");
  });

  it("works with SSH remote format", () => {
    setupPackageFixture({ repository: { url: "https://github.com/microsoft/workspace-tools" } });
    gitRemote("add", "first", "git@github.com:kenotron/workspace-tools.git");
    gitRemote("add", "second", "git@github.com:microsoft/workspace-tools.git");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");
  });

  it("works with shorthand repository format", () => {
    setupPackageFixture({ repository: { url: "github:microsoft/workspace-tools" } });

    // HTTPS
    gitRemote("add", "first", "https://github.com/kenotron/workspace-tools.git");
    gitRemote("add", "second", "https://github.com/microsoft/workspace-tools.git");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // SSH
    gitRemote("set-url", "second", "git@github.com:microsoft/workspace-tools.git");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");
  });

  it("works with VSO repository and mismatched remote format", () => {
    setupPackageFixture({ repository: { url: "https://foo.visualstudio.com/bar/_git/some-repo" } });
    // The multi-remote scenario is less common with VSO/ADO, but cover it just in case
    gitRemote("add", "first", "https://baz.visualstudio.com/bar/_git/some-repo");

    // VSO HTTPS
    gitRemote("add", "second", "https://foo.visualstudio.com/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // VSO HTTPS with defaultCollection
    gitRemote("set-url", "second", "https://foo.visualstudio.com/DefaultCollection/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // VSO SSH
    gitRemote("set-url", "second", "foo@vs-ssh.visualstudio.com:v3/foo/bar/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // ADO HTTPS
    gitRemote("set-url", "second", "https://dev.azure.com/foo/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // ADO HTTPS with user
    gitRemote("set-url", "second", "https://foo@dev.azure.com/foo/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // ADO SSH
    gitRemote("set-url", "second", "git@ssh.dev.azure.com:v3/foo/bar/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");
  });

  it("works with ADO repository and mismatched remote format", () => {
    setupPackageFixture({ repository: { url: "https://dev.azure.com/foo/bar/_git/some-repo" } });
    // The multi-remote scenario is less common with VSO/ADO, but cover it just in case
    gitRemote("add", "first", "https://dev.azure.com/baz/bar/_git/some-repo");

    // ADO HTTPS
    gitRemote("add", "second", "https://dev.azure.com/foo/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // ADO HTTPS with user
    gitRemote("set-url", "second", "https://foo@dev.azure.com/foo/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // ADO SSH
    gitRemote("set-url", "second", "git@ssh.dev.azure.com:v3/foo/bar/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // VSO HTTPS
    gitRemote("set-url", "second", "https://foo.visualstudio.com/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // VSO HTTPS with defaultCollection
    gitRemote("set-url", "second", "https://foo.visualstudio.com/DefaultCollection/bar/_git/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");

    // VSO SSH
    gitRemote("set-url", "second", "foo@vs-ssh.visualstudio.com:v3/foo/bar/some-repo");
    expect(getDefaultRemote(root)).toBe("second");
    expect(getDefaultRemote(root, true)).toBe("second");
  });
});
