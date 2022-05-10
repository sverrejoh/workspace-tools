"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllTrackedFiles = exports.getDefaultRemote = exports.getDefaultBranch = exports.getDefaultRemoteBranch = exports.parseRemoteBranch = exports.getRemoteBranch = exports.getParentBranch = exports.revertLocalChanges = exports.stageAndCommit = exports.commit = exports.stage = exports.init = exports.getFileAddedHash = exports.getCurrentHash = exports.getShortBranchName = exports.getFullBranchRef = exports.getBranchName = exports.getUserEmail = exports.getRecentCommitMessages = exports.getStagedChanges = exports.getChangesBetweenRefs = exports.getBranchChanges = exports.getChanges = exports.getUnstagedChanges = exports.fetchRemoteBranch = exports.fetchRemote = exports.getUntrackedChanges = exports.gitFailFast = exports.git = exports.addGitObserver = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const paths_1 = require("./paths");
const git_url_parse_1 = __importDefault(require("git-url-parse"));
function gitError(message, e) {
    if (e && e instanceof Error) {
        return new Error(`${message}: ${e.message}`);
    }
    return new Error(message);
}
/**
 * A maxBuffer override globally for all git operations
 * Bumps up the default to 500MB as opposed to the 1MB
 * Override this value with "GIT_MAX_BUFFER" environment variable
 */
const MaxBufferOption = process.env.GIT_MAX_BUFFER ? parseInt(process.env.GIT_MAX_BUFFER) : 500 * 1024 * 1024;
const observers = [];
let observing;
/**
 * Adds an observer for the git operations, e.g. for testing
 * @param observer
 */
function addGitObserver(observer) {
    observers.push(observer);
}
exports.addGitObserver = addGitObserver;
/**
 * Runs git command - use this for read only commands
 */
function git(args, options) {
    const results = (0, child_process_1.spawnSync)("git", args, Object.assign({ maxBuffer: MaxBufferOption }, options));
    let output;
    if (results.status === 0) {
        output = {
            stderr: results.stderr.toString().trimRight(),
            stdout: results.stdout.toString().trimRight(),
            success: true,
        };
    }
    else {
        output = {
            stderr: results.stderr.toString().trimRight(),
            stdout: results.stdout.toString().trimRight(),
            success: false,
        };
    }
    // notify observers, flipping the observing bit to prevent infinite loops
    if (!observing) {
        observing = true;
        for (const observer of observers) {
            observer(args, output);
        }
        observing = false;
    }
    return output;
}
exports.git = git;
/**
 * Runs git command - use this for commands that makes changes to the file system
 */
function gitFailFast(args, options) {
    const gitResult = git(args, options);
    if (!gitResult.success) {
        process.exitCode = 1;
        throw gitError(`CRITICAL ERROR: running git command: git ${args.join(" ")}!
    ${gitResult.stdout && gitResult.stdout.toString().trimRight()}
    ${gitResult.stderr && gitResult.stderr.toString().trimRight()}`);
    }
}
exports.gitFailFast = gitFailFast;
function getUntrackedChanges(cwd) {
    try {
        const results = git(["status", "--short"], { cwd });
        if (!results.success) {
            return [];
        }
        const changes = results.stdout;
        if (changes.length == 0) {
            return [];
        }
        const lines = changes.split(/\0/).filter((line) => line) || [];
        const untracked = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line[0] === " " || line[0] === "?") {
                untracked.push(line.substr(3));
            }
            else if (line[0] === "R") {
                i++;
            }
        }
        return untracked;
    }
    catch (e) {
        throw gitError(`Cannot gather information about untracked changes`, e);
    }
}
exports.getUntrackedChanges = getUntrackedChanges;
function fetchRemote(remote, cwd) {
    const results = git(["fetch", "--", remote], { cwd });
    if (!results.success) {
        throw gitError(`Cannot fetch remote: ${remote}`);
    }
}
exports.fetchRemote = fetchRemote;
function fetchRemoteBranch(remote, remoteBranch, cwd) {
    const results = git(["fetch", "--", remote, remoteBranch], { cwd });
    if (!results.success) {
        throw gitError(`Cannot fetch remote: ${remote} ${remoteBranch}`);
    }
}
exports.fetchRemoteBranch = fetchRemoteBranch;
/**
 * Gets all the changes that have not been staged yet
 * @param cwd
 */
function getUnstagedChanges(cwd) {
    try {
        return processGitOutput(git(["--no-pager", "diff", "--name-only", "--relative"], { cwd }));
    }
    catch (e) {
        throw gitError(`Cannot gather information about unstaged changes`, e);
    }
}
exports.getUnstagedChanges = getUnstagedChanges;
function getChanges(branch, cwd) {
    try {
        return processGitOutput(git(["--no-pager", "diff", "--relative", "--name-only", branch + "..."], { cwd }));
    }
    catch (e) {
        throw gitError(`Cannot gather information about changes`, e);
    }
}
exports.getChanges = getChanges;
/**
 * Gets all the changes between the branch and the merge-base
 * @param branch
 * @param cwd
 */
function getBranchChanges(branch, cwd) {
    return getChangesBetweenRefs(branch, "", [], "", cwd);
}
exports.getBranchChanges = getBranchChanges;
function getChangesBetweenRefs(fromRef, toRef, options, pattern, cwd) {
    try {
        return processGitOutput(git(["--no-pager", "diff", "--name-only", "--relative", ...options, `${fromRef}...${toRef}`, ...(pattern ? ["--", pattern] : [])], {
            cwd,
        }));
    }
    catch (e) {
        throw gitError(`Cannot gather information about change between refs changes (${fromRef} to ${toRef})`, e);
    }
}
exports.getChangesBetweenRefs = getChangesBetweenRefs;
function getStagedChanges(cwd) {
    try {
        return processGitOutput(git(["--no-pager", "diff", "--relative", "--staged", "--name-only"], { cwd }));
    }
    catch (e) {
        throw gitError(`Cannot gather information about staged changes`, e);
    }
}
exports.getStagedChanges = getStagedChanges;
function getRecentCommitMessages(branch, cwd) {
    try {
        const results = git(["log", "--decorate", "--pretty=format:%s", `${branch}..HEAD`], { cwd });
        if (!results.success) {
            return [];
        }
        let changes = results.stdout;
        let lines = changes.split(/\n/) || [];
        return lines.map((line) => line.trim());
    }
    catch (e) {
        throw gitError(`Cannot gather information about recent commits`, e);
    }
}
exports.getRecentCommitMessages = getRecentCommitMessages;
function getUserEmail(cwd) {
    try {
        const results = git(["config", "user.email"], { cwd });
        if (!results.success) {
            return null;
        }
        return results.stdout;
    }
    catch (e) {
        throw gitError(`Cannot gather information about user.email`, e);
    }
}
exports.getUserEmail = getUserEmail;
function getBranchName(cwd) {
    try {
        const results = git(["rev-parse", "--abbrev-ref", "HEAD"], { cwd });
        if (results.success) {
            return results.stdout;
        }
    }
    catch (e) {
        throw gitError(`Cannot get branch name`, e);
    }
    return null;
}
exports.getBranchName = getBranchName;
function getFullBranchRef(branch, cwd) {
    const showRefResults = git(["show-ref", "--heads", branch], { cwd });
    if (showRefResults.success) {
        return showRefResults.stdout.split(" ")[1];
    }
    return null;
}
exports.getFullBranchRef = getFullBranchRef;
function getShortBranchName(fullBranchRef, cwd) {
    const showRefResults = git(["name-rev", "--name-only", fullBranchRef], {
        cwd,
    });
    if (showRefResults.success) {
        return showRefResults.stdout;
    }
    return null;
}
exports.getShortBranchName = getShortBranchName;
function getCurrentHash(cwd) {
    try {
        const results = git(["rev-parse", "HEAD"], { cwd });
        if (results.success) {
            return results.stdout;
        }
    }
    catch (e) {
        throw gitError(`Cannot get current git hash`, e);
    }
    return null;
}
exports.getCurrentHash = getCurrentHash;
/**
 * Get the commit hash in which the file was first added.
 */
function getFileAddedHash(filename, cwd) {
    const results = git(["rev-list", "HEAD", filename], { cwd });
    if (results.success) {
        return results.stdout.trim().split("\n").slice(-1)[0];
    }
    return undefined;
}
exports.getFileAddedHash = getFileAddedHash;
function init(cwd, email, username) {
    git(["init"], { cwd });
    const configLines = git(["config", "--list"], { cwd }).stdout.split("\n");
    if (!configLines.find((line) => line.includes("user.name"))) {
        if (!username) {
            throw gitError("must include a username when initializing git repo");
        }
        git(["config", "user.name", username], { cwd });
    }
    if (!configLines.find((line) => line.includes("user.email"))) {
        if (!email) {
            throw new Error("must include a email when initializing git repo");
        }
        git(["config", "user.email", email], { cwd });
    }
}
exports.init = init;
function stage(patterns, cwd) {
    try {
        patterns.forEach((pattern) => {
            git(["add", pattern], { cwd });
        });
    }
    catch (e) {
        throw gitError(`Cannot stage changes`, e);
    }
}
exports.stage = stage;
function commit(message, cwd, options = []) {
    try {
        const commitResults = git(["commit", "-m", message, ...options], { cwd });
        if (!commitResults.success) {
            throw new Error(`Cannot commit changes: ${commitResults.stdout} ${commitResults.stderr}`);
        }
    }
    catch (e) {
        throw gitError(`Cannot commit changes`, e);
    }
}
exports.commit = commit;
function stageAndCommit(patterns, message, cwd, commitOptions = []) {
    stage(patterns, cwd);
    commit(message, cwd, commitOptions);
}
exports.stageAndCommit = stageAndCommit;
function revertLocalChanges(cwd) {
    const stash = `beachball_${new Date().getTime()}`;
    git(["stash", "push", "-u", "-m", stash], { cwd });
    const results = git(["stash", "list"]);
    if (results.success) {
        const lines = results.stdout.split(/\n/);
        const foundLine = lines.find((line) => line.includes(stash));
        if (foundLine) {
            const matched = foundLine.match(/^[^:]+/);
            if (matched) {
                git(["stash", "drop", matched[0]]);
                return true;
            }
        }
    }
    return false;
}
exports.revertLocalChanges = revertLocalChanges;
function getParentBranch(cwd) {
    const branchName = getBranchName(cwd);
    if (!branchName || branchName === "HEAD") {
        return null;
    }
    const showBranchResult = git(["show-branch", "-a"], { cwd });
    if (showBranchResult.success) {
        const showBranchLines = showBranchResult.stdout.split(/\n/);
        const parentLine = showBranchLines.find((line) => line.indexOf("*") > -1 && line.indexOf(branchName) < 0 && line.indexOf("publish_") < 0);
        if (!parentLine) {
            return null;
        }
        const matched = parentLine.match(/\[(.*)\]/);
        if (!matched) {
            return null;
        }
        return matched[1];
    }
    return null;
}
exports.getParentBranch = getParentBranch;
function getRemoteBranch(branch, cwd) {
    const results = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", `${branch}@\{u\}`], { cwd });
    if (results.success) {
        return results.stdout.trim();
    }
    return null;
}
exports.getRemoteBranch = getRemoteBranch;
function parseRemoteBranch(branch) {
    const firstSlashPos = branch.indexOf("/", 0);
    const remote = branch.substring(0, firstSlashPos);
    const remoteBranch = branch.substring(firstSlashPos + 1);
    return {
        remote,
        remoteBranch,
    };
}
exports.parseRemoteBranch = parseRemoteBranch;
function normalizeRepoUrl(repositoryUrl) {
    try {
        const parsed = (0, git_url_parse_1.default)(repositoryUrl);
        return parsed
            .toString("https")
            .replace(/\.git$/, "")
            .toLowerCase();
    }
    catch (e) {
        return "";
    }
}
function getDefaultRemoteBranch(branch, cwd) {
    const defaultRemote = getDefaultRemote(cwd);
    const showRemote = git(["remote", "show", defaultRemote], { cwd });
    /**
     * The `showRemote` returns something like this in stdout:
     *
     * * remote origin
     *   Fetch URL: ../monorepo-upstream/
     *   Push  URL: ../monorepo-upstream/
     *   HEAD branch: main
     *
     */
    const headBranchLine = showRemote.stdout.split(/\n/).find((line) => line.includes("HEAD branch"));
    let remoteDefaultBranch;
    if (headBranchLine) {
        remoteDefaultBranch = headBranchLine.replace(/^\s*HEAD branch:\s+/, "");
    }
    branch = branch || remoteDefaultBranch || getDefaultBranch(cwd);
    return `${defaultRemote}/${branch}`;
}
exports.getDefaultRemoteBranch = getDefaultRemoteBranch;
function getDefaultBranch(cwd) {
    const result = git(["config", "init.defaultBranch"], { cwd });
    if (!result.success) {
        // Default to the legacy 'master' for backwards compat and old git clients
        return "master";
    }
    return result.stdout.trim();
}
exports.getDefaultBranch = getDefaultBranch;
function getDefaultRemote(cwd) {
    let packageJson;
    try {
        packageJson = JSON.parse(fs_1.default.readFileSync(path_1.default.join((0, paths_1.findGitRoot)(cwd), "package.json")).toString());
    }
    catch (e) {
        throw new Error("invalid package.json detected");
    }
    const { repository } = packageJson;
    let repositoryUrl = "";
    if (typeof repository === "string") {
        repositoryUrl = repository;
    }
    else if (repository && repository.url) {
        repositoryUrl = repository.url;
    }
    const normalizedUrl = normalizeRepoUrl(repositoryUrl);
    const remotesResult = git(["remote", "-v"], { cwd });
    if (remotesResult.success) {
        const allRemotes = {};
        remotesResult.stdout.split("\n").forEach((line) => {
            const parts = line.split(/\s+/);
            allRemotes[normalizeRepoUrl(parts[1])] = parts[0];
        });
        if (Object.keys(allRemotes).length > 0) {
            const remote = allRemotes[normalizedUrl];
            if (remote) {
                return remote;
            }
        }
    }
    return "origin";
}
exports.getDefaultRemote = getDefaultRemote;
function listAllTrackedFiles(patterns, cwd) {
    if (patterns) {
        const results = git(["ls-files", ...patterns], { cwd });
        if (results.success) {
            return results.stdout.split(/\n/);
        }
    }
    return [];
}
exports.listAllTrackedFiles = listAllTrackedFiles;
function processGitOutput(output) {
    if (!output.success) {
        return [];
    }
    let stdout = output.stdout;
    let lines = stdout.split(/\n/) || [];
    return lines
        .filter((line) => line.trim() !== "")
        .map((line) => line.trim())
        .filter((line) => !line.includes("node_modules"));
}
