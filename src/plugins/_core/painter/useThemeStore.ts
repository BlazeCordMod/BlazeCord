import { blzlogger } from "@api/logger";
import { kvStorage } from "@loader/kvStorage";
import { lookupByProps } from "@metro/common/wrappers";
import { memoize } from "es-toolkit";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { parseColorManifest } from "./parser";
import type { BlazeCordTheme } from "./types";
import { ALL_THEMES } from "./themes";

const logger = blzlogger.createChild("ThemeStore");
const formDividerModule = lookupByProps("DIVIDER_COLORS");
const tokenRefModule = lookupByProps("SemanticColor");
const UserSettingsActionCreators = lookupByProps("updateTheme", "setShouldSyncAppearanceSettings").asLazy();

interface ThemeStore {
    appliedTheme: string | null;
    currentRef: ThemeRefState | null;
    themes: BlazeCordTheme[];
    setThemeRef: (id: string | null) => void;
}

interface ThemeRefState {
    key: string;
    color: ReturnType<typeof parseColorManifest>;
}

// FIX: Fuck this, Pylix that was wack asf lol.
// let _inc = 4;
export function getCurrentRef() {
    return useThemeStore.getState().currentRef;
}

// TODO: For debugging only, remove once done
// NOPE: It stays, its my friend now. :)
window.applyTheme = applyTheme;

export function applyTheme(id: string | null, update: boolean) {
    useThemeStore.getState().setThemeRef(id);
    const ref = getCurrentRef();

    if (id && ref) {
        // "Register" our theme
        formDividerModule.wait(exp => {
            exp.DIVIDER_COLORS[ref.key] = exp.DIVIDER_COLORS[ref.color.reference];
        });

        tokenRefModule.wait(tokenRef => {
            tokenRef.Theme[ref.key.toUpperCase()] = ref.key;

            const shadowKeys = Object.keys(tokenRef.Shadow);
            const semanticKeys = Object.keys(tokenRef.SemanticColor);

            for (let i = 0; i < shadowKeys.length; i++) {
                const k = shadowKeys[i];
                tokenRef.Shadow[k][ref.key] = tokenRef.Shadow[k][ref.color.reference];
            }

            for (let i = 0; i < semanticKeys.length; i++) {
                const k = semanticKeys[i];
                tokenRef.SemanticColor[k][ref.key] = {
                    ...tokenRef.SemanticColor[k][ref.color.reference],
                };
            }
        });
    }

    if (update) {
        const manifest = id != null && useThemeStore.getState().themes.find(t => t.id === id);

        // biome-ignore lint/complexity/useOptionalChain: ?. won't filter out falsys
        const base = ref?.color.reference || (manifest && manifest.main.base) || "darker";
        UserSettingsActionCreators.setShouldSyncAppearanceSettings(false);
        UserSettingsActionCreators.updateTheme(ref ? ref.key : base);
    }
}

export const useThemeStore = create(
    persist<ThemeStore>(
        (set, get) => ({
            appliedTheme: null,
            currentRef: null,
            themes: ALL_THEMES,//[PURPLE_HAZE, OCEAN_MIST, FOREST_WHISPER, SUNSET_EMBER, COLD_HEIGHTS, MOCHA_THEME, BLOOD_TERMINAL, ROSIE_PINK_THEME, SOLAR_BLOOM],
            setThemeRef: (id: string | null) => {
                set({ appliedTheme: null, currentRef: null });

                if (id != null) {
                    const theme = get().themes.find(t => t.id === id);
                    if (!theme) throw new Error(`Theme is not installed: ${id}`);

                    // Generate a stable key from the theme id
                    const stableKey = `blz-theme-${id.replace(/[^a-z0-9]/gi, "_")}`;

                    set({
                        appliedTheme: id,
                        currentRef: {
                            key: stableKey,
                            color: parseColorManifest(theme),
                        },
                    });
                }
            },
        }),
        {
            name: "theme-store",
            version: 2,
            storage: createJSONStorage(() => kvStorage),
            onRehydrateStorage() {
                return (state) => {
                    if (state) {
                        // Reapply the theme on store rehydration (app start)
                        if (state.appliedTheme) {
                            // Use a small timeout to let Discord's modules load?
                            setTimeout(() => {
                                applyTheme(state.appliedTheme, true);
                            }, 250);
                        }

                        if (state.themes.length !== 0) {
                            for (const theme of state.themes) {
                                theme.asAddonMetadata = memoize(() => ({
                                    id: theme.id,
                                    name: theme.display.name,
                                    description: theme.display.description,
                                    authors: theme.display.authors,
                                }));
                            }
                        }
                    }
                };
            },
            // FIX: Fuck this 2, Null theme boogaloo~
            // Why partialize and set currentRef to null? :/
            // partialize: s => ({
            //     ...s,
            //     currentRef: null,
            // }),
        },
    ),
);