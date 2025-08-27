import { patcher } from "#plugin-context";
import type { ViewStyle } from "react-native";
import { ImageBackground, StyleSheet } from "react-native";
import { chroma } from "@metro/common/libraries";
import { lookupByFilePath } from "@metro/common/wrappers";
import { findInReactTree } from "src/utils/objects";
import { useWallpaperStore, type Wallpaper } from "../stores/wallpaperStore";
import { useThemeStore } from "../../painter/useThemeStore";
import type { BlazeCordTheme } from "../../painter/types";

const Messages = lookupByFilePath("components_native/chat/Messages.tsx").asLazy();

type BackgroundType = BlazeCordTheme["main"]["background"] | (Wallpaper & { blur?: number; opacity?: number });

function getFallbackThemeBackground(): BlazeCordTheme["main"]["background"] | undefined {
    console.log("[Wallpapers] getFallbackThemeBackground() called");

    const state = useThemeStore.getState();
    console.log("[Wallpapers] Theme store state:", {
        appliedTheme: state.appliedTheme,
        themeCount: state.themes.length
    });

    const theme = state.themes.find(t => t.id === state.appliedTheme);
    console.log("[Wallpapers] Found theme:", theme ? { id: theme.id } : "undefined");

    const background = theme?.main.background;
    console.log("[Wallpapers] Fallback background:", background);

    return background;
}

function ThemeBackground({ children }: { children: React.ReactNode }) {
    console.log("[Wallpapers] ThemeBackground component rendering");

    const { appliedWallpaper, followTheme, blurAmount, opacity } = useWallpaperStore();
    console.log("[Wallpapers] Wallpaper store state:", {
        appliedWallpaper: appliedWallpaper ? {
            hasName: !!appliedWallpaper.name,
            image: appliedWallpaper.image,
            hasImage: !!appliedWallpaper.image
        } : null,
        followTheme,
        blurAmount,
        opacity
    });

    const bg: BackgroundType | undefined = !followTheme && appliedWallpaper
        ? { ...appliedWallpaper, blur: blurAmount, opacity }
        : getFallbackThemeBackground();

    console.log("[Wallpapers] Computed background config:", {
        hasBg: !!bg,
        bgType: bg ? ('name' in bg ? 'wallpaper' : 'theme') : 'none',
        image: bg?.image,
        imageExists: !!bg?.image,
        imageNotHidden: bg?.image !== "hidden",
        blur: bg?.blur,
        opacity: bg?.opacity
    });

    if (!bg?.image || bg.image === "hidden") {
        console.log("[Wallpapers] Skipping background render - no valid image");
        return <>{children}</>;
    }

    console.log("[Wallpapers] Rendering ImageBackground with:", {
        uri: bg.image,
        blurRadius: bg.blur ?? 0,
        imageType: bg.image.startsWith('content://') ? 'content-uri' :
            bg.image.startsWith('file://') ? 'file-uri' :
                bg.image.startsWith('http') ? 'http-url' : 'unknown'
    });

    return (
        <ImageBackground
            source={{ uri: bg.image }}
            blurRadius={bg.blur ?? 0}
            style={{ flex: 1, height: "100%" }}
            onLoad={() => console.log("[Wallpapers] ImageBackground loaded successfully")}
            onLoadStart={() => console.log("[Wallpapers] ImageBackground loading started")}
            onLoadEnd={() => console.log("[Wallpapers] ImageBackground loading ended")}
            onError={(e) => console.error("[Wallpapers] ImageBackground error:", e.nativeEvent)}
        >
            {children}
        </ImageBackground>
    );
}

export default function patchChatBackground() {
    console.log("[Wallpapers] patchChatBackground() called");

    if (!Messages) {
        console.error("[Wallpapers] Messages component not found!");
        return;
    }

    console.log("[Wallpapers] Messages component found, applying patch...");

    patcher.after(Messages, "render", (_, ret) => {
        console.log("[Wallpapers] Messages.render patch triggered");
        console.log("[Wallpapers] Render return value type:", ret ? ret.$$typeof?.toString() : "null");

        if (!ret) {
            console.error("[Wallpapers] No render return value!");
            return ret;
        }

        const ChatScreen = findInReactTree(ret, (n: any) =>
            n?.props?.style && "HACK_fixModalInteraction" in n.props
        );

        console.log("[Wallpapers] ChatScreen node found:", !!ChatScreen);
        if (ChatScreen) {
            console.log("[Wallpapers] ChatScreen props:", {
                hasStyle: !!ChatScreen.props.style,
                styleType: Array.isArray(ChatScreen.props.style) ? 'array' : 'object'
            });
        }

        const { appliedWallpaper, followTheme, blurAmount, opacity } = useWallpaperStore.getState();
        console.log("[Wallpapers] Patch wallpaper store state:", {
            appliedWallpaper: appliedWallpaper ? {
                hasName: !!appliedWallpaper.name,
                image: appliedWallpaper.image
            } : null,
            followTheme,
            blurAmount,
            opacity
        });

        const bg: BackgroundType | undefined = !followTheme && appliedWallpaper
            ? { ...appliedWallpaper, blur: blurAmount, opacity }
            : getFallbackThemeBackground();

        console.log("[Wallpapers] Patch background config:", {
            hasBg: !!bg,
            bgOpacity: bg?.opacity,
            bgImage: bg?.image,
            bgType: bg ? ('name' in bg ? 'wallpaper' : 'theme') : 'none'
        });

        if (ChatScreen && bg?.opacity != null) {
            console.log("[Wallpapers] Applying opacity overlay:", bg.opacity);

            try {
                const flat = StyleSheet.flatten(ChatScreen.props.style) as ViewStyle;
                console.log("[Wallpapers] Flattened style:", {
                    backgroundColor: flat.backgroundColor,
                    hasBackgroundColor: !!flat.backgroundColor
                });

                const baseColor = flat.backgroundColor ?? "#000";
                console.log("[Wallpapers] Base color:", baseColor);

                const overlay = chroma(baseColor).alpha(1 - bg.opacity).hex();
                console.log("[Wallpapers] Computed overlay:", overlay);

                ChatScreen.props.style = [ChatScreen.props.style, { backgroundColor: overlay }];
                console.log("[Wallpapers] Updated ChatScreen style");
            } catch (error) {
                console.error("[Wallpapers] Error applying opacity:", error);
            }
        } else {
            console.log("[Wallpapers] Skipping opacity overlay - conditions not met:", {
                hasChatScreen: !!ChatScreen,
                hasBgOpacity: bg?.opacity != null
            });
        }

        console.log("[Wallpapers] Wrapping with ThemeBackground");
        return <ThemeBackground>{ret}</ThemeBackground>;
    });

    console.log("[Wallpapers] Chat background patch applied successfully");
}