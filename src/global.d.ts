declare global {
    // Build constants
    const __DEV__: boolean;

    // ReactNative/Hermes globals
    var __turboModuleProxy: (name: string) => unknown;
    var globalEvalWithSourceUrl: (script: string, sourceURL: string) => any;
    var nativePerformanceNow: typeof performance.now;
    var nativeModuleProxy: Record<string, any>;

    var BLAZECORD_START_TIME: number;

    interface Window {
        [key: string]: any;
        blazecord: any;
    }
}

export {};
