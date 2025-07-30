import { definePlugin, definePluginSettings } from "#plugin-context";
import { byProps, byName } from "@metro/common/filters";
import { getStore, byStoreName } from "@metro/common/stores";
import { waitFor } from "@metro/internal/modules";
import { showToast } from "@api/toasts";
import { Devs } from "@data/constants";
import { modifyIfNeeded } from "./parse";
import { patchRealmoji } from "./realshit";

const settings = definePluginSettings({
    emojiSize: {
        type: "slider",
        label: "Display Size",
        points: [16, 32, 48, 56, 64, 96, 128, 256],
        default: 48,
    },
    hyperlink: {
        type: "boolean",
        label: "Hyperlink Emoji's",
        description: "Use markdown links for emoji [EmojiName](URL)",
        default: true,
    },
    realshit: {
        type: "boolean",
        label: "Blazed Emoji's",
        description: "Render spoofed emoji as real within BlazeCord.",
        default: true,
    },
    forceMoji: {
        type: "boolean",
        label: "Override Nitro",
        description: "Use spoofed emojis even if user has real Nitro.",
        default: false,
    },
});

let haveNitro = false;
export default definePlugin({
    name: "Unlock Nitro Emoji's",
    description: "Unlocks all emoji by spoofing Nitro checks.",
    authors: [Devs.Blaze],

    patches: [
        {
            id: "fuck-nitro-checks",
            target: byProps(["canUseEmojisEverywhere", "canUseAnimatedEmojis"]),
            patch(module, patcher) {
                patcher.instead(module, "canUseEmojisEverywhere", () => true);
                patcher.instead(module, "canUseAnimatedEmojis", () => true);
            },
        },
        {
            id: "hook-message",
            target: byProps(["sendMessage", "receiveMessage"]),
            patch(module, patcher) {
                patcher.before(module, "sendMessage", ([, msg]: any[]) => {
                    haveNitro = getStore("UserStore").getCurrentUser()?.premiumType != null;
                    modifyIfNeeded(msg, haveNitro, settings);
                });
            },
        },
        {
            id: "hook-upload",
            target: byProps(["uploadLocalFiles"]),
            patch(module, patcher) {
                patcher.before(module, "uploadLocalFiles", ([uploadArgs]: any[]) => {
                    haveNitro = getStore("UserStore").getCurrentUser()?.premiumType != null;
                    modifyIfNeeded(uploadArgs?.parsedMessage, haveNitro, settings);
                });
            },
        },
        {
            id: "render-real-emojis",
            target: byName("RowManager"),
            patch(module, patcher) {
                patchRealmoji(module, patcher, () => settings.get().realshit);
            },
        },
    ],

    start() {
        // Listen for settings changes immediately (hot updates)
        settings.subscribe(
            (state) => state,
            (newState) => {
                console.log("[NitroMoji] Settings changed:", newState);
                // Optionally reapply or update logic here
            }
        );

        // Wait for UserStore to grab nitro status
        waitFor(byStoreName("UserStore"), (UserStore) => {
            const user = UserStore.getCurrentUser?.();
            haveNitro = user?.premiumType != null;
        });
    },

    cleanup() {
        settings.unsubscribeAll();
    },
});