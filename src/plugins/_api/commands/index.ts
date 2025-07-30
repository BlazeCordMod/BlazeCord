import { definePlugin } from "#plugin-context";
import { Devs } from "@data/constants";
import { waitFor } from "@metro/internal/modules";
import { byProps } from "@metro/common/filters";
import { patchAppCommands } from "./slash";

export default definePlugin({
    name: "Commands",
    description: "Add slash command api to BlazeCord",
    authors: [Devs.Blaze],
    required: true,
    start() {
        waitFor(
            byProps(["getBuiltInCommands"]),
            () => {
                patchAppCommands();
            }
        );
    },
    cleanup() {
        // Cha-Cha Real-Smooth~
    },
});