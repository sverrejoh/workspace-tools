/**
 * Create a temp directory containing the given fixture name in a git repo.
 * Be sure to call `cleanupFixtures()` after all tests to clean up temp directories.
 */
export declare function setupFixture(fixtureName: string): string;
export declare function cleanupFixtures(): void;
export declare function setupLocalRemote(cwd: string, remoteName: string, fixtureName: string): void;
