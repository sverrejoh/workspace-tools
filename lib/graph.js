"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._resetGraphCache = exports.getPackageGraph = void 0;
const dependencies_1 = require("./dependencies");
const graphCache = new Map();
function getPackageGraph(packages) {
    if (graphCache.has(packages)) {
        return graphCache.get(packages);
    }
    const edges = [];
    for (const [pkg, info] of Object.entries(packages)) {
        const deps = (0, dependencies_1.getInternalDeps)(info, packages);
        for (const dep of deps) {
            edges.push([dep, pkg]);
        }
    }
    graphCache.set(packages, edges);
    return edges;
}
exports.getPackageGraph = getPackageGraph;
/**
 * @internal resets the graph cache for internal testing purpose only
 */
function _resetGraphCache() {
    graphCache.clear();
}
exports._resetGraphCache = _resetGraphCache;
