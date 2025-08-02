import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import { chroma } from "@metro/common/libraries";
import { patcher } from "#plugin-context";
import { lookupByFilePath } from "@metro/common/wrappers";
import { findInReactTree } from "src/utils/objects";
import { useWallpaperStore } from "../stores/wallpaperStore";
import { useThemeStore } from "../../painter/useThemeStore";

const Messages = lookupByFilePath("components_native/chat/Messages.tsx").asLazy();

interface BackgroundProps {
    image?: string;
    blur?: number;
    opacity?: number;
}

function getFallbackThemeBackground(): BackgroundProps | undefined {
    const state = useThemeStore.getState();
    const theme = state.themes.find(t => t.id === state.appliedTheme);
    return theme?.main.background;
}

function ThemeBackground({ children }: { children: React.ReactNode }) {
    const { appliedWallpaper, followTheme } = useWallpaperStore.getState();
    const bg: BackgroundProps | undefined = !followTheme && appliedWallpaper
        ? appliedWallpaper
        : getFallbackThemeBackground();

    if (!bg?.image || bg.image === "hidden") return <>{children}</>;

    return (
        <ImageBackground
            source={{ uri: bg.image }}
            blurRadius={typeof bg.blur === "number" ? bg.blur : 0}
            style={{ flex: 1, height: "100%" }}>
            {children}
        </ImageBackground>
    );
}

export default function patchChatBackground() {
    patcher.after(Messages, "render", (_, ret) => {
        const node = findInReactTree(
            ret,
            (n: any) => n?.props?.style && "HACK_fixModalInteraction" in n.props
        );

        const { appliedWallpaper, followTheme } = useWallpaperStore.getState();
        const bg: BackgroundProps | undefined = !followTheme && appliedWallpaper
            ? appliedWallpaper
            : getFallbackThemeBackground();

        if (node && bg?.opacity != null) {
            const flat = StyleSheet.flatten(node.props.style) as ViewStyle;
            const baseColor = flat.backgroundColor ?? "#000";
            const overlay = chroma(baseColor)
                .alpha(1 - bg.opacity)
                .hex();
            node.props.style = [node.props.style, { backgroundColor: overlay }];
        }

        return <ThemeBackground>{ret}</ThemeBackground>;
    });

    console.log("[Wallpapers] Chat background patch applied");
}