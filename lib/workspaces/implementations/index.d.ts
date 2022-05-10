export declare type WorkspaceImplementations = "yarn" | "pnpm" | "rush" | "npm" | "lerna";
export interface ImplementationAndLockFile {
    implementation: WorkspaceImplementations | undefined;
    lockFile: string;
}
export declare function getWorkspaceImplementationAndLockFile(cwd: string, cache?: {
    [cwd: string]: ImplementationAndLockFile;
}): {
    implementation: WorkspaceImplementations | undefined;
    lockFile: string;
} | undefined;
export declare function getWorkspaceImplementation(cwd: string, cache?: {
    [cwd: string]: ImplementationAndLockFile;
}): WorkspaceImplementations | undefined;
