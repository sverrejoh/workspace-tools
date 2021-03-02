import { getRepositoryName } from "../git/getRepositoryName";

// This mostly uses gitUrlParse internally, so only test a couple basic github cases plus the
// the special cases we added to handle the annoyingly large variety of equivalent VSTS/ADO URLs
describe("getRepositoryName", () => {
  it("works with github HTTPS URLs", () => {
    expect(getRepositoryName("https://github.com/microsoft/workspace-tools")).toBe("microsoft/workspace-tools");
  });
  it("works with github HTTPS URLs with .git", () => {
    expect(getRepositoryName("https://github.com/microsoft/workspace-tools.git")).toBe("microsoft/workspace-tools");
  });
  it("works with github SSH URLs", () => {
    expect(getRepositoryName("git@github.com:microsoft/workspace-tools.git")).toBe("microsoft/workspace-tools");
  });

  // All of these variants point to the same repo
  it("works with VSO HTTPS URLs", () => {
    expect(getRepositoryName("https://foo.visualstudio.com/bar/_git/some-repo")).toBe("foo/bar/some-repo");
  });
  it("works with VSO HTTPS URLs with DefaultCollection", () => {
    expect(getRepositoryName("https://foo.visualstudio.com/DefaultCollection/bar/_git/some-repo")).toBe(
      "foo/bar/some-repo"
    );
  });
  it("works with VSO SSH URLs", () => {
    expect(getRepositoryName("foo@vs-ssh.visualstudio.com:v3/foo/bar/some-repo")).toBe("foo/bar/some-repo");
  });
  it("works with ADO HTTPS URLs", () => {
    expect(getRepositoryName("https://dev.azure.com/foo/bar/_git/some-repo")).toBe("foo/bar/some-repo");
  });
  it("works with ADO HTTPS URLs with user", () => {
    expect(getRepositoryName("https://foo@dev.azure.com/foo/bar/_git/some-repo")).toBe("foo/bar/some-repo");
  });
  it("works ADO SSH URLs", () => {
    expect(getRepositoryName("git@ssh.dev.azure.com:v3/foo/bar/some-repo")).toBe("foo/bar/some-repo");
  });
});
