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
    const state = useThemeStore.getState();
    const theme = state.themes.find(t => t.id === state.appliedTheme);
    return theme?.main.background;
}

function ThemeBackground({ children }: { children: React.ReactNode }) {
    const { appliedWallpaper, followTheme, blurAmount, opacity } = useWallpaperStore();
    const bg: BackgroundType | undefined = !followTheme &&
        appliedWallpaper ? { ...appliedWallpaper, blur: blurAmount, opacity } : getFallbackThemeBackground();

    if (!bg?.image || bg.image === "hidden")
        return <>{children}</>;

    return (
        <ImageBackground
            source={{ uri: bg.image }}
            blurRadius={bg.blur ?? 0}
            style={{ flex: 1, height: "100%" }}>
            {children}
        </ImageBackground>
    );
}

export default function patchChatBackground() {
    patcher.after(Messages, "render", (_, ret) => {
        const ChatScreen = findInReactTree(ret, (n: any) =>
            n?.props?.style && "HACK_fixModalInteraction" in n.props
        );

        const { appliedWallpaper, followTheme, blurAmount, opacity } = useWallpaperStore.getState();
        const bg: BackgroundType | undefined = !followTheme && appliedWallpaper
            ? { ...appliedWallpaper, blur: blurAmount, opacity } : getFallbackThemeBackground();

        if (ChatScreen && bg?.opacity != null) {
            const flat = StyleSheet.flatten(ChatScreen.props.style) as ViewStyle;
            const baseColor = flat.backgroundColor ?? "#000";
            const overlay = chroma(baseColor).alpha(1 - bg.opacity).hex();
            ChatScreen.props.style = [ChatScreen.props.style, { backgroundColor: overlay }];
        }

        return <ThemeBackground>{ret}</ThemeBackground>;
    });

    console.log("[Wallpapers] Chat background patch applied");
}