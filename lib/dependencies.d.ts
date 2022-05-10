import { PackageInfo, PackageInfos } from "./types/PackageInfo";
export declare function getDependentMap(packages: PackageInfos): Map<string, Set<string>>;
/**
 * for a package graph of a->b->c (where b depends on a), transitive consumers of a are b & c and their consumers (or what are the consequences of a)
 * @param targets
 * @param packages
 * @param scope
 */
export declare function getTransitiveConsumers(targets: string[], packages: PackageInfos, scope?: string[]): string[];
/**
 * for a package graph of a->b->c (where b depends on a), transitive providers of c are a & b and their providers (or what is needed to satisfy c)
 * @param targets
 * @param packages
 */
export declare function getTransitiveProviders(targets: string[], packages: PackageInfos): string[];
export declare const getTransitiveDependencies: typeof getTransitiveProviders;
export declare const getTransitiveDependents: typeof getTransitiveConsumers;
export declare function getInternalDeps(info: PackageInfo, packages: PackageInfos): string[];
