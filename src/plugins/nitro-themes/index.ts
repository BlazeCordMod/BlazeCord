import { definePlugin } from "#plugin-context";
import { byProps } from "@metro/common/filters";
import { byStoreName } from "@metro/common/stores";
import { Devs } from "@data/constants";

export default definePlugin({
    name: "Unlock Nitro Themes",
    description: "Unlocks all built-in themes by spoofing Nitro.",
    authors: [Devs.Blaze],

    patches: [
        {
            id: "no-sync",
            target: byProps(["setShouldSyncAppearanceSettings"]),
            patch(module, patcher) {
                module.setShouldSyncAppearanceSettings(false);
                patcher.instead(module, "setShouldSyncAppearanceSettings", () => false);
            },
        },
        {
            id: "hack-client-themes",
            target: byProps(["canUseClientThemes"]),
            patch(module, patcher) {
                patcher.instead(module, "canUseClientThemes", () => true);
            },
        },
        {
            id: "force-client-theme-experiment",
            target: byStoreName("ExperimentStore"),
            patch(module, patcher) {
                patcher.after(module, "getUserExperimentDescriptor", ([expName], res) => {
                    if (expName === "2023-02_client_themes_mobile" && res?.bucket) {
                        return {
                            type: "user",
                            revision: 1,
                            population: 0,
                            bucket: 1,
                            override: true,
                        };
                    }
                });
            },
        },
    ],

    start() {
        const FluxDispatcher = require("@metro/filters").lookup(byProps(["dispatch", "subscribe"]));
        const UserSettingsProtoStore = require("@metro/filters").lookup(byStoreName("UserSettingsProtoStore"));
        const savedTheme = UserSettingsProtoStore?.settings?.appearance?.theme;
        const savedPresetId = UserSettingsProtoStore?.settings?.appearance?.clientThemeSettings?.backgroundGradientPresetId?.value;

        if (savedTheme || savedPresetId) {
            FluxDispatcher.dispatch({
                type: "USER_SETTINGS_PROTO_UPDATE",
                local: true,
                partial: true,
                settings: {
                    type: 1,
                    proto: {
                        appearance: {
                            ...(savedTheme && { theme: savedTheme }),
                            ...(savedPresetId && {
                                clientThemeSettings: {
                                    backgroundGradientPresetId: {
                                        value: savedPresetId,
                                    },
                                },
                            }),
                        },
                    },
                },
            });
        }
    },

    cleanup() {
        // Cha-Cha Real-Smooth~  
    },
});