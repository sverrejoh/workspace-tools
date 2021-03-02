//
// Basic git wrappers
//

import { spawnSync } from "child_process";

/**
 * A maxBuffer override globally for all git operations
 * Bumps up the default to 500MB as opposed to the 1MB
 * Override this value with "GIT_MAX_BUFFER" environment variable
 */
const MaxBufferOption = process.env.GIT_MAX_BUFFER ? parseInt(process.env.GIT_MAX_BUFFER) : 500 * 1024 * 1024;

// Observes the git operations called from git() or gitFailFast()
export type GitProcessOutput = {
  stderr: string;
  stdout: string;
  success: boolean;
};
type GitObserver = (args: string[], output: GitProcessOutput) => void;
const observers: GitObserver[] = [];
let observing: boolean;

/**
 * Adds an observer for the git operations, e.g. for testing
 * @param observer
 */
export function addGitObserver(observer: GitObserver) {
  observers.push(observer);
}

/**
 * Runs git command - use this for read only commands
 */
export function git(args: string[], options?: { cwd: string; maxBuffer?: number }): GitProcessOutput {
  const results = spawnSync("git", args, { maxBuffer: MaxBufferOption, ...options });
  const output: GitProcessOutput = {
    stderr: results.stderr.toString().trimRight(),
    stdout: results.stdout.toString().trimRight(),
    success: results.status === 0,
  };

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

/**
 * Runs git command - use this for commands that makes changes to the file system
 */
export function gitFailFast(args: string[], options?: { cwd: string; maxBuffer?: number }) {
  const gitResult = git(args, options);
  if (!gitResult.success) {
    console.error(`CRITICAL ERROR: running git command: git ${args.join(" ")}!`);
    console.error(gitResult.stdout && gitResult.stdout.toString().trimRight());
    console.error(gitResult.stderr && gitResult.stderr.toString().trimRight());
    process.exit(1);
  }
}
