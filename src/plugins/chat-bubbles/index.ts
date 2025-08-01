import { definePlugin, definePluginSettings, logger } from "#plugin-context";
import { Devs } from "@data/constants";
import BubbleModule from "@loader/modules/BubbleModule";
import { byProps } from "@metro/common/filters";
import { tokens } from "@metro/common/libraries";
import { ThemeStore, byStoreName } from "@metro/common/stores";
import { waitFor } from "@metro/internal/modules";
import { shallow } from "zustand/shallow";

const settings = definePluginSettings({
    avatarRadius: {
        type: "slider",
        label: "Avatar Curve",
        points: [0, 3, 6, 9, 12, 15, 18],
        default: 12,
    },
    bubbleChatRadius: {
        type: "slider",
        label: "Bubble Curve",
        points: [0, 3, 6, 9, 12, 15, 18],
        default: 12,
    },
    bubbleChatColor: {
        type: "string",
        label: "Bubble Color",
        placeholder: "#RRGGBBAA",
        description: "Bubble Color in #RRGGBBAA format. (default: BG_BASE_TERTIARY is used)",
        validate: value => /^#[0-9A-Fa-f]{8}$/.test(value),
    },
});

export default definePlugin({
    name: "Chat Tweaks",
    description: "Adds custom message bubbles & avatars in chat.",
    authors: [Devs.Blaze],

    start() {
        BubbleModule.hookBubbles();

        const getBubbleColor = () => {
            const userColor = settings.get().bubbleChatColor;
            if (userColor) return userColor;

            const token = tokens.colors.BG_BASE_TERTIARY;
            return tokens.internal.resolveSemanticColor(ThemeStore.theme, token);
        };

        const updateBubbleAppearance = () => {
            const { avatarRadius, bubbleChatRadius } = settings.get();
            const color = getBubbleColor();

            BubbleModule.configure(avatarRadius, bubbleChatRadius, color).catch(logger.error);
        };

        waitFor(byStoreName("ThemeStore"), ThemeStore => {
            ThemeStore.addChangeListener(updateBubbleAppearance);
        });

        waitFor(byProps(["_interceptors", "subscribe"]), FluxDispatcher => {
            for (const event of ["CACHE_LOADED", "SELECTIVELY_SYNCED_USER_SETTINGS_UPDATE"]) {
                FluxDispatcher.subscribe(event, updateBubbleAppearance);
            }
        });

        // React to settings changes
        settings.subscribe(
            s => [s.avatarRadius, s.bubbleChatRadius, s.bubbleChatColor] as const,
            () => updateBubbleAppearance(),
            { equalityFn: shallow },
        );
    },

    cleanup() {
        BubbleModule.unhookBubbles();
        settings.unsubscribeAll();
    },
});
