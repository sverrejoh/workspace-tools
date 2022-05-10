"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../scope");
describe("getScopedPackages", () => {
    it("can match scopes for full matches for an array", () => {
        const results = (0, scope_1.getScopedPackages)(["foo", "bar"], ["foo", "bar", "baz"]);
        expect(results).toContain("foo");
        expect(results).toContain("bar");
        expect(results).not.toContain("baz");
    });
    it("can match scopes for full matches for a map", () => {
        const results = (0, scope_1.getScopedPackages)(["foo", "bar"], {
            foo: {},
            bar: {},
            baz: {},
        });
        expect(results).toContain("foo");
        expect(results).toContain("bar");
        expect(results).not.toContain("baz");
    });
    it("can match scopes for full matches for a map of PackageInfos", () => {
        const results = (0, scope_1.getScopedPackages)(["foo", "bar"], {
            foo: { name: "foo", packageJsonPath: "nowhere", version: "1.0.0" },
            bar: { name: "bar", packageJsonPath: "nowhere", version: "1.0.0" },
            baz: { name: "baz", packageJsonPath: "nowhere", version: "1.0.0" },
        });
        expect(results).toContain("foo");
        expect(results).toContain("bar");
        expect(results).not.toContain("baz");
    });
    it("can match with wildcards", () => {
        const results = (0, scope_1.getScopedPackages)(["foo*"], ["foo1", "foo2", "baz"]);
        expect(results).toContain("foo1");
        expect(results).toContain("foo2");
        expect(results).not.toContain("baz");
    });
    it("can match with npm package scopes", () => {
        const results = (0, scope_1.getScopedPackages)(["foo"], ["@yay/foo", "@yay1/foo", "foo", "baz"]);
        expect(results).toContain("@yay/foo");
        expect(results).toContain("@yay1/foo");
        expect(results).toContain("foo");
        expect(results).not.toContain("baz");
    });
    it("can match with npm package scopes with wildcards", () => {
        const results = (0, scope_1.getScopedPackages)(["foo*"], ["@yay/foo1", "@yay1/foo2", "foo", "baz"]);
        expect(results).toContain("@yay/foo1");
        expect(results).toContain("@yay1/foo2");
        expect(results).toContain("foo");
        expect(results).not.toContain("baz");
    });
    it("uses the correct package scope when the search pattern starts a @ character", () => {
        const results = (0, scope_1.getScopedPackages)(["@yay/foo*"], ["@yay/foo1", "@yay1/foo2", "foo", "baz"]);
        expect(results).toContain("@yay/foo1");
        expect(results).not.toContain("@yay1/foo2");
        expect(results).not.toContain("foo");
        expect(results).not.toContain("baz");
    });
    it("can deal with brace expansion with scopes", () => {
        const results = (0, scope_1.getScopedPackages)(["@yay/foo{1,2}"], ["@yay/foo1", "@yay/foo2", "@yay/foo3", "foo", "baz"]);
        expect(results).toContain("@yay/foo1");
        expect(results).toContain("@yay/foo2");
        expect(results).not.toContain("@yay/foo3");
        expect(results).not.toContain("foo");
        expect(results).not.toContain("baz");
    });
    it("can deal with negated search", () => {
        const results = (0, scope_1.getScopedPackages)(["@yay/foo*", "!@yay/foo3"], ["@yay/foo1", "@yay/foo2", "@yay/foo3", "foo", "baz"]);
        expect(results).toContain("@yay/foo1");
        expect(results).toContain("@yay/foo2");
        expect(results).not.toContain("@yay/foo3");
        expect(results).not.toContain("foo");
        expect(results).not.toContain("baz");
    });
});
