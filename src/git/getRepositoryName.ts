import gitUrlParse from "git-url-parse";

/**
 * Get a repository full name (owner/organization and repo) from any kind of repository URL.
 * Example: returns `microsoft/workspace-tools` for `https://github.com/microsoft/workspace-tools.git`
 */
export function getRepositoryName(url: string) {
  try {
    // Mostly use this standard library, but fix some VSO/ADO-specific quirks to account for the
    // fact that all of the following URLs should be considered to point to the same repo:
    // https://foo.visualstudio.com/bar/_git/some-repo
    // https://foo.visualstudio.com/DefaultCollection/bar/_git/some-repo
    // foo@vs-ssh.visualstudio.com:v3/foo/bar/some-repo
    // https://dev.azure.com/foo/bar/_git/some-repo
    // https://foo@dev.azure.com/foo/bar/_git/some-repo
    // git@ssh.dev.azure.com:v3/foo/bar/some-repo
    const parsedUrl = gitUrlParse(url);
    let repositoryName = parsedUrl.full_name.replace(/\b_git\//, "");
    let organization = parsedUrl.organization;

    if (parsedUrl.source === "visualstudio.com" && (!organization || organization === "DefaultCollection")) {
      // parsedUrl.user will be the organization name, like "foo", only for SSH URLs
      // parsedUrl.resource will be like "foo.visualstudio.com"
      organization = parsedUrl.user || parsedUrl.resource.replace(".visualstudio.com", "");
      repositoryName = repositoryName.replace(/\bDefaultCollection\//, "");
    }

    // For some reason for ADO SSH URLs, gitUrlParse removes the organization part.
    // (This line also adds it back for VSO.)
    if (!repositoryName.startsWith(organization)) {
      repositoryName = `${organization}/${repositoryName}`;
    }

    return repositoryName;
  } catch (err) {
    return "";
  }
}
