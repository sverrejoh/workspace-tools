"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalDeps = exports.getTransitiveDependents = exports.getTransitiveDependencies = exports.getTransitiveProviders = exports.getTransitiveConsumers = exports.getDependentMap = void 0;
const graphCache = new Map();
function memoizedKey(packages, scope = []) {
    return JSON.stringify({ packages, scope });
}
function getPackageGraph(packages, scope = []) {
    const key = memoizedKey(packages, scope);
    if (graphCache.has(key)) {
        return graphCache.get(key);
    }
    const edges = [];
    const visited = new Set();
    const stack = scope.length > 0 ? [...scope] : Object.keys(packages);
    while (stack.length > 0) {
        const pkg = stack.pop();
        if (visited.has(pkg)) {
            continue;
        }
        visited.add(pkg);
        const info = packages[pkg];
        const deps = getInternalDeps(info, packages);
        if (deps.length > 0) {
            for (const dep of deps) {
                stack.push(dep);
                edges.push([dep, pkg]);
            }
        }
        else {
            edges.push([null, pkg]);
        }
    }
    graphCache.set(key, edges);
    return edges;
}
function getDependentMap(packages) {
    const graph = getPackageGraph(packages);
    const map = new Map();
    for (const [from, to] of graph) {
        if (!map.has(to)) {
            map.set(to, new Set());
        }
        if (from) {
            map.get(to).add(from);
        }
    }
    return map;
}
exports.getDependentMap = getDependentMap;
/**
 * for a package graph of a->b->c (where b depends on a), transitive consumers of a are b & c and their consumers (or what are the consequences of a)
 * @param targets
 * @param packages
 * @param scope
 */
function getTransitiveConsumers(targets, packages, scope = []) {
    const graph = getPackageGraph(packages, scope);
    const pkgQueue = [...targets];
    const visited = new Set();
    while (pkgQueue.length > 0) {
        const pkg = pkgQueue.shift();
        if (!visited.has(pkg)) {
            visited.add(pkg);
            for (const [from, to] of graph) {
                if (from === pkg) {
                    pkgQueue.push(to);
                }
            }
        }
    }
    return [...visited].filter((pkg) => !targets.includes(pkg));
}
exports.getTransitiveConsumers = getTransitiveConsumers;
/**
 * for a package graph of a->b->c (where b depends on a), transitive providers of c are a & b and their providers (or what is needed to satisfy c)
 * @param targets
 * @param packages
 */
function getTransitiveProviders(targets, packages) {
    const graph = getPackageGraph(packages);
    const pkgQueue = [...targets];
    const visited = new Set();
    while (pkgQueue.length > 0) {
        const pkg = pkgQueue.shift();
        if (!visited.has(pkg)) {
            visited.add(pkg);
            for (const [from, to] of graph) {
                if (to === pkg && from) {
                    pkgQueue.push(from);
                }
            }
        }
    }
    return [...visited].filter((pkg) => !targets.includes(pkg));
}
exports.getTransitiveProviders = getTransitiveProviders;
// package dependencies = getting transitive providers
exports.getTransitiveDependencies = getTransitiveProviders;
// package dependents = getting transitive consumers
exports.getTransitiveDependents = getTransitiveConsumers;
function getInternalDeps(info, packages) {
    const deps = Object.keys(Object.assign(Object.assign({}, info.dependencies), info.devDependencies));
    return Object.keys(packages).filter((pkg) => deps.includes(pkg));
}
exports.getInternalDeps = getInternalDeps;
