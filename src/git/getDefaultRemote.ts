import fs from "fs-extra";
import path from "path";
import { findGitRoot } from "../paths";
import { PackageInfo } from "../types/PackageInfo";
import { getRepositoryName } from "./getRepositoryName";
import { git } from "./git";

/**
 * Gets a reference to `branch` relative to the default remote. The default remote is the one
 * matching the `repository` field in package.json. Throws if `cwd` is not in a git repo
 * or there's no package.json at the repo root.
 *
 * The order of preference for the remote used is:
 * 1. If `repository` is defined in package.json, the remote with a matching URL (if `strict`
 *    is true, throws an error if no matching remote exists)
 * 2. `upstream` if defined
 * 3. `origin` if defined
 * 4. The first defined remote
 * 5. If there are no defined remotes: throws an error if `strict` is true; otherwise returns `origin`
 *
 * @param branch Name of the branch to use (defaults to `master`)
 * @param cwd Get repository info relative to this directory.
 * @param strict If true, throw an error if remote info can't be found, or if a `repository` is
 * specified in package.json and no matching remote is found.
 * @returns A branch reference like `upstream/master` or `origin/master`.
 */
export function getDefaultRemoteBranch(branch: string, cwd: string, strict?: boolean) {
  const defaultRemote = getDefaultRemote(cwd, strict);
  return `${defaultRemote}/${branch || "master"}`;
}

/**
 * Get the name of the default remote: the one matching the `repository` field in package.json.
 * Throws if `cwd` is not in a git repo or there's no package.json at the repo root.
 *
 * The order of preference for returned remotes is:
 * 1. If `repository` is defined in package.json, the remote with a matching URL (if `strict`
 *    is true, throws an error if no matching remote exists)
 * 2. `upstream` if defined
 * 3. `origin` if defined
 * 4. The first defined remote
 * 5. If there are no defined remotes: throws an error if `strict` is true; otherwise returns `origin`
 *
 * @param cwd Get repository info relative to this directory.
 * @param strict If true, throw an error if remote info can't be found, or if a `repository` is
 * specified in package.json and no matching remote is found.
 * @returns The name of the inferred default remote.
 */
export function getDefaultRemote(cwd: string, strict?: boolean) {
  const logOrThrow = (message: string) => {
    if (strict) {
      throw new Error(message);
    }
    console.log(message);
  };

  let packageJson: Partial<PackageInfo> = {};
  const gitRoot = findGitRoot(cwd);
  if (!gitRoot) {
    throw new Error(`Directory "${cwd}" does not appear to be in a git repository`);
  }

  const packageJsonPath = path.join(gitRoot, "package.json");
  try {
    packageJson = fs.readJSONSync(packageJsonPath);
  } catch (e) {
    throw new Error(`Could not read "${packageJsonPath}"`);
  }

  const remotesResult = git(["remote", "-v"], { cwd });
  if (!remotesResult.success) {
    logOrThrow(`Could not determine available git remotes under "${cwd}"`);
  }

  /** Mapping from remote URL to full name (owner and repo name) */
  const remotes: { [remoteRepoUrl: string]: string } = {};
  remotesResult.stdout.split("\n").forEach((line) => {
    const [remoteName, remoteUrl] = line.split(/\s+/);
    const remoteRepoName = getRepositoryName(remoteUrl);
    if (remoteRepoName) {
      remotes[remoteRepoName] = remoteName;
    }
  });

  const { repository } = packageJson;
  const repositoryUrl = typeof repository === "string" ? repository : (repository && repository.url) || "";
  if (!repositoryUrl) {
    console.log(
      `Valid "repository" key not found in "${packageJsonPath}". Consider adding this info for more accurate git remote detection.`
    );
  }
  /** Repository full name (owner and repo name) specified in package.json */
  const repositoryName = getRepositoryName(repositoryUrl);

  if (repositoryName) {
    // If the repository name was found in package.json, check for a matching remote
    if (remotes[repositoryName]) {
      return remotes[repositoryName];
    }

    // If `strict` is true, and repositoryName is found, there MUST be a matching remote
    logOrThrow(`Could not find remote pointing to repository "${repositoryName}".`);
  }

  // Default to upstream or origin if available, or the first remote otherwise
  const allRemoteNames = Object.values(remotes);
  const fallbacks = ["upstream", "origin", ...allRemoteNames];
  for (const fallback of fallbacks) {
    if (allRemoteNames.includes(fallback)) {
      console.log(`Default to remote "${fallback}"`);
      return fallback;
    }
  }

  // If we get here, no git remotes were found. This should probably always be an error (since
  // subsequent operations which require a remote likely won't work), but to match old behavior,
  // still default to "origin" unless `strict` is true.
  logOrThrow(`Could not find any remotes in git repo at "${gitRoot}".`);
  console.log(`Assuming default remote "origin".`);
  return "origin";
}
