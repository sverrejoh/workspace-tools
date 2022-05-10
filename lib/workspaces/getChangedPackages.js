"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangedPackages = exports.getChangedPackagesBetweenRefs = void 0;
const git_1 = require("../git");
const getPackagesByFiles_1 = require("./getPackagesByFiles");
const tap = (a, fn) => {
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
function getChangedPackagesBetweenRefs(cwd, fromRef, toRef = "", ignoreGlobs = []) {
    console.log("getChangedPackagesBetweenRefs");
    let changes = [
        ...new Set([
            ...tap((0, git_1.getUntrackedChanges)(cwd) || [], (it) => console.log("getUntrackedChanges", cwd, it)),
            ...tap((0, git_1.getUnstagedChanges)(cwd) || [], (it) => console.log("getUnstagedChanges", cwd, it)),
            ...tap((0, git_1.getChangesBetweenRefs)(fromRef, toRef, [], "", cwd) || [], (it) => console.log("getChangesBetweenRefs", cwd, fromRef, toRef, it)),
            ...tap((0, git_1.getStagedChanges)(cwd) || [], (it) => console.log("getStagedChanges", it)),
        ]),
    ];
    return (0, getPackagesByFiles_1.getPackagesByFiles)(cwd, changes, ignoreGlobs, true);
}
exports.getChangedPackagesBetweenRefs = getChangedPackagesBetweenRefs;
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
function getChangedPackages(cwd, target, ignoreGlobs = []) {
    const targetBranch = target || (0, git_1.getDefaultRemoteBranch)(undefined, cwd);
    console.log("getChangedPackages");
    let changes = [
        ...new Set([
            ...tap((0, git_1.getUntrackedChanges)(cwd) || [], (it) => console.log("getUntrackedChanges", cwd, it)),
            ...tap((0, git_1.getUnstagedChanges)(cwd) || [], (it) => console.log("getUnstagedChanges", cwd, it)),
            ...tap((0, git_1.getBranchChanges)(targetBranch, cwd) || [], (it) => console.log("getBranchChanges", targetBranch, cwd, it)),
            ...tap((0, git_1.getStagedChanges)(cwd) || [], (it) => console.log("getStagedChanges", it))
        ]),
    ];
    return (0, getPackagesByFiles_1.getPackagesByFiles)(cwd, changes, ignoreGlobs, true);
}
exports.getChangedPackages = getChangedPackages;
