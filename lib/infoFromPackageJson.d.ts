import { PackageInfo } from "./types/PackageInfo";
export declare function infoFromPackageJson(packageJson: {
    name: string;
    version: string;
    dependencies?: {
        [dep: string]: string;
    };
    devDependencies?: {
        [dep: string]: string;
    };
    peerDependencies?: {
        [dep: string]: string;
    };
    private?: boolean;
    pipeline?: any;
    scripts?: any;
}, packageJsonPath: string): PackageInfo;
