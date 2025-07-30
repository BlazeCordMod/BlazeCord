import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Button } from "@components/Discord";
import { hideSheet } from "@components/utils/sheets";

import { useWallpaperStore } from "../../../../../plugins/_core/wallpapers/stores/wallpaperStore";
import type { Wallpaper } from "../../../../../plugins/_core/wallpapers/stores/wallpaperStore";

interface Props {
    wallpaper: Wallpaper;
}

export default function WallpaperPreviewSheet({ wallpaper }: Props) {
    const { applyWallpaper, deleteWallpaper } = useWallpaperStore();

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: wallpaper.image }}
                style={[styles.previewImage, { opacity: wallpaper.opacity ?? 1 }]}
                blurRadius={wallpaper.blur || 0}
            />

            <View style={styles.controls}>
                <Button
                    text="Apply"
                    onPress={() => {
                        applyWallpaper(wallpaper);
                        hideSheet("WallpaperPreviewSheet");
                    }}
                />
                {!wallpaper.isBuiltin && (
                    <Button
                        text="Delete"
                        color="danger"
                        onPress={() => {
                            const categoryName = useWallpaperStore
                                .getState()
                                .categories.find(cat =>
                                    cat.wallpapers.includes(wallpaper)
                                )?.name;

                            if (categoryName) {
                                deleteWallpaper(categoryName, wallpaper.name);
                            }

                            hideSheet("WallpaperPreviewSheet");
                        }}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    previewImage: {
        width: "100%",
        height: "80%",
    },
    controls: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-around",
    },
});