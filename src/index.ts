import { wtlogger } from "@api/logger";
import { initCheckForUpdates } from "@stores/useUpdaterStore";
import reportErrorOnInitialization from "./error-reporter";
import { blazecordGlobalObject } from "./globals";
import { initializeMetro } from "./metro/internal";
import { initializePlugins } from "./stores/usePluginStore";

export function initializeBlazeCord() {
    try {
        wtlogger.info("Initializing BlazeCord...");

        initializeMetro();
        initializePlugins();

        initCheckForUpdates();

        window.blazecord = blazecordGlobalObject();

        wtlogger.info(`Fully initialized BlazeCord in ${(nativePerformanceNow() - BLAZECORD_START_TIME).toFixed(2)}ms!`);
    } catch (e) {
        reportErrorOnInitialization(e);
    }
}
