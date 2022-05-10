/**
 * Searches all package names based on "scoping" (i.e. "scope" in the sense of inclusion)
 * NOTE: scoping is different than package scopes (@scope/package)
 * @param search
 * @param packages
 */
export declare function getScopedPackages(search: string[], packages: {
    [pkg: string]: unknown;
} | string[]): string[];
