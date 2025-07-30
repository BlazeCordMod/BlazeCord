import type { AddonMetadata } from "@components/Blaze/Settings/pages/Addon";
import type { BlazeCordTheme } from "../types";

export const AURORA_VIOLET: BlazeCordTheme = {
    id: "aurora.violet",
    type: "theme",
    display: {
        name: "Aurora Violet",
        description: "A deep purple and soft pink theme.",
        authors: [{ name: "Blaze", id: "300547560840495104" }],
    },
    main: {
        base: "dark",
        colors: {
            semantic: {
                // Core
                BACKGROUND_PRIMARY: { value: "#1D1829" },
                BACKGROUND_SECONDARY: { value: "#2A2238" },
                BACKGROUND_TERTIARY: { value: "#141019" },
                HEADER_PRIMARY: { value: "#E0D7FF" },
                TEXT_NORMAL: { value: "#E8DFFF" },

                // Interactives
                INTERACTIVE_NORMAL: { value: "#C6B3F0" },
                INTERACTIVE_HOVER: { value: "#D9C6FF" },
                BACKGROUND_ACCENT: { value: "#B28FCE" },
                TEXT_LINK: { value: "#C49AFF" },

                // Specials
                BACKGROUND_MENTIONED: {
                    value: "#FF9ED8",
                    opacity: 0.15
                },
                BACKGROUND_MODIFIER_ACCENT: { value: "#3F3251" },
                CHANNELS_DEFAULT: { value: "#B6ABD0" },

                // Maintained from templates
                BACKGROUND_MOBILE_PRIMARY: { value: "#1D1829" },
                BACKGROUND_MODIFIER_HOVER: { value: "#352A45" },
                REDESIGN_BUTTON_PRIMARY_PRESSED_BACKGROUND: { value: "#9B72CB" }
            },
            raw: {
                // Purple Base
                PRIMARY_600: "#1D1829",
                PRIMARY_700: "#141019",
                PRIMARY_800: "#2A2238",

                // Accents
                BRAND_500: "#C49AFF",
                BLUE_500: "#9B72CB",
                RED_500: "#FF9ED8",
                GREEN_500: "#A6E3A1",

                // Text/UI
                PRIMARY_100: "#E0D7FF",
                PRIMARY_300: "#B6ABD0",
                PRIMARY_460: "#7A6B99",

                // Boost Colors
                GUILD_BOOSTING_PURPLE: "#C49AFF",
                GUILD_BOOSTING_PINK: "#FF9ED8"
            }
        }
    },
    asAddonMetadata(): AddonMetadata {
        throw new Error("Function not implemented.");
    },
};