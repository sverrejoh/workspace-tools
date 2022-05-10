/**
 * Starting from `cwd`, searches up the directory hierarchy for `pathName`
 * @param pathName
 * @param cwd
 */
export declare function searchUp(pathName: string, cwd: string): string | null;
export declare function findGitRoot(cwd: string): string | null;
export declare function findPackageRoot(cwd: string): string | null;
export declare function getChangePath(cwd: string): string | null;
export declare function isChildOf(child: string, parent: string): boolean;
