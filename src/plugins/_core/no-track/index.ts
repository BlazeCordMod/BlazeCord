import { Devs } from "@data/constants";
import { byProps } from "@metro/common/filters";
import { definePlugin } from "#plugin-context";

// This plugin is unfinished... maybe?
export default definePlugin({
    name: "NoTrack",
    description: "Kills Discord's analytics and crash reporting",
    authors: [Devs.Blaze],
    required: true,

    patches: [
        {
            id: "no-sentry",
            target: byProps(["initSentry"]),
            patch(module, patcher) {
                patcher.instead(module, "initSentry", () => undefined);
            },
        },
        {
            id: "no-tracker",
            target: byProps(["track", "trackMaker"]),
            patch(module, patcher) {
                patcher.instead(module, "track", () => Promise.resolve());
            },
        },
    ],
});
