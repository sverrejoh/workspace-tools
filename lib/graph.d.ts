import { PackageInfos } from "./types/PackageInfo";
export declare function getPackageGraph(packages: PackageInfos): [string, string][];
/**
 * @internal resets the graph cache for internal testing purpose only
 */
export declare function _resetGraphCache(): void;
