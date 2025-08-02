import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Wallpaper {
    name: string;
    image: string;
    isBuiltin: boolean;
}

export interface WallpaperCategory {
    name: string;
    wallpapers: Wallpaper[];
}

export const useWallpaperStore = create(
    persist<
        {
            categories: WallpaperCategory[];
            appliedWallpaper?: Wallpaper;
            blurAmount: number;
            opacity: number;
            followTheme: boolean;
            addWallpaper: (category: string, wallpaper: Wallpaper) => void;
            deleteWallpaper: (category: string, name: string) => void;
            applyWallpaper: (wallpaper: Wallpaper) => void;
            clearWallpaper: () => void;
            setFollowTheme: (value: boolean) => void;
            setBlurAmount: (blur: number) => void;
            setOpacity: (opacity: number) => void;
        }
    >(
        (set, get) => ({
            categories: [
                {
                    name: "Particles",
                    wallpapers: [
                        { name: "Pink", image: "https://example.com/pink.jpeg", isBuiltin: true },
                        // ... more wallpapers
                    ],
                },
            ],
            appliedWallpaper: undefined,
            blurAmount: 0,
            opacity: 1,
            followTheme: false,
            addWallpaper: (categoryName, wallpaper) =>
                set(state => {
                    const existingCategory = state.categories.find(cat => cat.name === categoryName);
                    if (existingCategory) {
                        return {
                            categories: state.categories.map(cat =>
                                cat.name === categoryName
                                    ? { ...cat, wallpapers: [...cat.wallpapers, wallpaper] }
                                    : cat
                            ),
                        };
                    }
                    return {
                        categories: [...state.categories, { name: categoryName, wallpapers: [wallpaper] }],
                    };
                }),
            deleteWallpaper: (categoryName, name) =>
                set(state => ({
                    categories: state.categories.map(cat =>
                        cat.name === categoryName
                            ? { ...cat, wallpapers: cat.wallpapers.filter(w => w.name !== name || w.isBuiltin) }
                            : cat
                    ),
                })),
            applyWallpaper: wallpaper => set({ appliedWallpaper: wallpaper }),
            clearWallpaper: () => set({ appliedWallpaper: undefined }),
            setFollowTheme: value => set({ followTheme: value }),
            setBlurAmount: blur => set({ blurAmount: blur }),
            setOpacity: opacity => set({ opacity }),
        }),
        {
            name: "wallpaper-store",
        }
    )
);