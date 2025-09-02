import { byFilePath, byName, byProps, byStoreName } from "./filters";
import { lookup, lookupAll, lookupLazy } from "../api";
import type { InteropOption } from "../filters";

// Your clean, type-safe lookup functions
export const lookupByProps = <T extends string>(...props: T[]) =>
    lookup(byProps<T>(props));

export const lookupByPropsAll = <T extends string>(...props: T[]) =>
    lookupAll(byProps<T>(props));

export const lookupByPropsLazy = <T extends string>(...props: T[]) =>
    lookupLazy(byProps<T>(props));

export const lookupByName = <T extends string>(name: T) =>
    lookup(byName(name));

export const lookupByNameAll = <T extends string>(name: T) =>
    lookupAll(byName(name));

export const lookupByNameLazy = <T extends string>(name: T) =>
    lookupLazy(byName(name));

export const lookupByStoreName = <T extends string>(name: T) =>
    lookup(byStoreName(name));

export const lookupByStoreNameAll = <T extends string>(name: T) =>
    lookupAll(byStoreName(name));

export const lookupByStoreNameLazy = <T extends string>(name: T) =>
    lookupLazy(byStoreName(name));

export const lookupByFilePath = (path: string, options?: InteropOption) =>
    lookup(byFilePath(path, options));

export const lookupByFilePathAll = (path: string, options?: InteropOption) =>
    lookupAll(byFilePath(path, options));

export const lookupByFilePathLazy = (path: string, options?: InteropOption) =>
    lookupLazy(byFilePath(path, options));