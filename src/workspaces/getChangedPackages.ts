import {
  getBranchChanges,
  getChangesBetweenRefs,
  getDefaultRemoteBranch,
  getStagedChanges,
  getUnstagedChanges,
  getUntrackedChanges,
} from "../git";
import { getPackagesByFiles } from "./getPackagesByFiles";

const tap = <T extends unknown>(a: T, fn: (a: T) => void): T => {
  fn(a);
  return a;
};

/**
 * Finds all packages that had been changed between two refs in the repo under cwd
 *
 * executes a "git diff $fromRef...$toRef" to get changes given a merge-base
 *
 * further explanation with the three dots:
 *
 * > git diff [--options] <commit>...<commit> [--] [<path>...]
 * >
 * >    This form is to view the changes on the branch containing and up to
 * >    the second <commit>, starting at a common ancestor of both
 * >    <commit>. "git diff A...B" is equivalent to "git diff
 * >    $(git-merge-base A B) B". You can omit any one of <commit>, which
 * >    has the same effect as using HEAD instead.
 *
 * @returns string[] of package names that have changed
 */
export function getChangedPackagesBetweenRefs(
  cwd: string,
  fromRef: string,
  toRef: string = "",
  ignoreGlobs: string[] = []
) {

  console.log("getChangedPackagesBetweenRefs");  
  let changes = [
    ...new Set([
      ...tap(getUntrackedChanges(cwd) || [], (it: unknown) => console.log("getUntrackedChanges", cwd, it)),
      ...tap(getUnstagedChanges(cwd) || [], (it: unknown) => console.log("getUnstagedChanges", cwd, it)),
      ...tap(getChangesBetweenRefs(fromRef, toRef, [], "", cwd) || [], (it: unknown) =>
        console.log("getChangesBetweenRefs", cwd, fromRef, toRef, it)
      ),
      ...tap(getStagedChanges(cwd) || [], (it: unknown) => console.log("getStagedChanges", it)),
    ]),
  ];

  return getPackagesByFiles(cwd, changes, ignoreGlobs, true);
}

/**
 * Finds all packages that had been changed in the repo under cwd
 *
 * executes a "git diff $Target..." to get changes given a merge-base
 *
 * further explanation with the three dots:
 *
 * > git diff [--options] <commit>...<commit> [--] [<path>...]
 * >
 * >    This form is to view the changes on the branch containing and up to
 * >    the second <commit>, starting at a common ancestor of both
 * >    <commit>. "git diff A...B" is equivalent to "git diff
 * >    $(git-merge-base A B) B". You can omit any one of <commit>, which
 * >    has the same effect as using HEAD instead.
 *
 * @returns string[] of package names that have changed
 */
export function getChangedPackages(cwd: string, target: string | undefined, ignoreGlobs: string[] = []) {
  const targetBranch = target || getDefaultRemoteBranch(undefined, cwd);

  console.log("getChangedPackages");
  let changes = [
    ...new Set([
      ...tap(getUntrackedChanges(cwd) || [], (it: unknown) => console.log("getUntrackedChanges", cwd, it)),
      ...tap(getUnstagedChanges(cwd) || [], (it: unknown) => console.log("getUnstagedChanges", cwd, it)),
      ...tap(getBranchChanges(targetBranch, cwd) || [], (it: unknown) => console.log("getBranchChanges", targetBranch, cwd, it)),
      ...tap(getStagedChanges(cwd) || [], (it: unknown) => console.log("getStagedChanges", it))
    ]),
  ];

  return getPackagesByFiles(cwd, changes, ignoreGlobs, true);
}
