import { create } from "zustand";

export interface Wallpaper {
    name: string;
    image: string;
    blur?: number;
    opacity?: number;
    isBuiltin: boolean;
};

export interface WallpaperCategory {
    name: string;
    wallpapers: Wallpaper[];
};

export const useWallpaperStore = create<{
    categories: WallpaperCategory[];
    appliedWallpaper?: Wallpaper;
    addWallpaper: (category: string, wallpaper: Wallpaper) => void;
    deleteWallpaper: (category: string, name: string) => void;
    applyWallpaper: (wallpaper: Wallpaper) => void;
    clearWallpaper: () => void;
    followTheme: boolean;
    setFollowTheme: (value: boolean) => void;
}>(set => ({
    categories: [
        {
            name: "Particles",
            wallpapers: [
                { name: "Pink", image: "https://raw.githubusercontent.com/BlazeK1ng420/BlazeK1ng420.github.io/refs/heads/base/assets/BlazeCord/Wallpapers/Particles/particles1.jpeg", isBuiltin: true },
                { name: "Lime", image: "https://raw.githubusercontent.com/BlazeK1ng420/BlazeK1ng420.github.io/refs/heads/base/assets/BlazeCord/Wallpapers/Particles/particles2.jpeg", isBuiltin: true },
                { name: "Purple", image: "https://raw.githubusercontent.com/BlazeK1ng420/BlazeK1ng420.github.io/refs/heads/base/assets/BlazeCord/Wallpapers/Particles/particles5.jpeg", isBuiltin: true },
                { name: "Teal", image: "https://raw.githubusercontent.com/BlazeK1ng420/BlazeK1ng420.github.io/refs/heads/base/assets/BlazeCord/Wallpapers/Particles/particles8.jpeg", isBuiltin: true },
                { name: "Blue", image: "https://raw.githubusercontent.com/BlazeK1ng420/BlazeK1ng420.github.io/refs/heads/base/assets/BlazeCord/Wallpapers/Particles/particles11.jpeg", isBuiltin: true },
                { name: "Red", image: "https://raw.githubusercontent.com/BlazeK1ng420/BlazeK1ng420.github.io/refs/heads/base/assets/BlazeCord/Wallpapers/Particles/particles14.jpeg", isBuiltin: true }
            ]
        }
    ],
    appliedWallpaper: undefined,
    followTheme: false, // Add initial value
    addWallpaper: (categoryName, wallpaper) =>
        set(state => {
            const existingCategory = state.categories.find(cat => cat.name === categoryName);
            if (existingCategory) {
                return {
                    categories: state.categories.map(cat =>
                        cat.name === categoryName ? { ...cat, wallpapers: [...cat.wallpapers, wallpaper] } : cat
                    )
                };
            }
            return {
                categories: [...state.categories, { name: categoryName, wallpapers: [wallpaper] }]
            };
        }),
    deleteWallpaper: (categoryName, name) =>
        set(state => {
            return {
                categories: state.categories.map(cat =>
                    cat.name === categoryName
                        ? { ...cat, wallpapers: cat.wallpapers.filter(w => w.name !== name || w.isBuiltin) }
                        : cat
                )
            };
        }),
    applyWallpaper: wallpaper => set({ appliedWallpaper: wallpaper }),
    clearWallpaper: () => set({ appliedWallpaper: undefined }),
    setFollowTheme: (value) => set({ followTheme: value }) // Add setter function
}));