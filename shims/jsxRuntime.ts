import { byProps } from "../src/metro/common/filters";
import { lookup } from "../src/metro/api";
import { getProxyFactory } from "../src/utils/lazy";

// Holds registered hooks for specific component names
type Callback = (Component: any, ret: JSX.Element) => JSX.Element | void;
const callbacks = new Map<string, Callback[]>();

// Lazy lookup of the JSX runtime module
let jsxRuntime = lookup(byProps(["jsx", "jsxs"])).asLazy((mod) => {
    jsxRuntime = mod;
    return mod;
});

// Component proxy unwrapping
function unproxyFirstArg<T>(args: T[]) {
    if (!args[0]) {
        throw new Error("The first argument (Component) is falsy. Ensure that you are passing a valid component.");
    }

    const factory = getProxyFactory(args[0]);
    if (factory) args[0] = factory();
    return args;
}

// Used by plugins to register JSX render interceptors
export function onJsxCreate(name: string, cb: Callback) {
    if (!callbacks.has(name)) callbacks.set(name, []);
    callbacks.get(name)!.push(cb);
}

export function deleteJsxCreate(name: string, cb: Callback) {
    const arr = callbacks.get(name);
    if (!arr) return;
    arr.splice(arr.indexOf(cb), 1);
    if (arr.length === 0) callbacks.delete(name);
}

// Central function to apply proxy + callback logic
function applyRuntimeHook(method: "jsx" | "jsxs", args: any[], ret: JSX.Element) {
    const [Component] = unproxyFirstArg(args);

    if (!Component) throw new Error("Invalid JSX component (null/undefined).");
    if (typeof ret?.type === "undefined") ret.type = "RCTView";

    const name = typeof Component === "function" ? Component.name : null;
    if (name && callbacks.has(name)) {
        for (const cb of callbacks.get(name)!) {
            const result = cb(Component, ret);
            if (result !== undefined) ret = result;
        }
    }

    return ret;
}


export const Fragment = Symbol.for("react.fragment");
// Wrapped JSX entry points
export const jsx = (...args: any[]) => applyRuntimeHook("jsx", args, jsxRuntime.jsx(...args));
export const jsxs = (...args: any[]) => applyRuntimeHook("jsxs", args, jsxRuntime.jsxs(...args));