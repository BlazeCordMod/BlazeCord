import { definePlugin } from "#plugin-context";
import { Devs } from "@data/constants";
import patchChatBackground from "./patches/background";

export default definePlugin({
    name: "Wallpapers",
    description: "Adds chat wallpapers to BlazeCord",
    authors: [Devs.Blaze],
    required: true,
    start() {
        patchChatBackground();
    },
});