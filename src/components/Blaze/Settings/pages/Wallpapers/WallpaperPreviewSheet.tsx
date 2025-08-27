import React, { useEffect, useCallback } from "react";
import { View, Image, StyleSheet, Dimensions, BackHandler } from "react-native";
import { Button, Slider, Text } from "@components/Discord";
import { hideSheet } from "@components/utils/sheets";
import { useWallpaperStore } from "@plugins/_core/wallpapers/stores/wallpaperStore";
import type { Wallpaper } from "@plugins/_core/wallpapers/stores/wallpaperStore";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Props {
    wallpaper: Wallpaper;
}

export default function WallpaperPreviewSheet({ wallpaper }: Props) {
    const {
        appliedWallpaper,
        blurAmount,
        opacity,
        applyWallpaper,
        clearWallpaper,
        deleteWallpaper,
        setBlurAmount,
        setOpacity,
        categories,
    } = useWallpaperStore();

    const isActive = appliedWallpaper?.name === wallpaper.name;

    // Close on hardware back button
    const closeSheet = useCallback(() => {
        hideSheet("WallpaperPreviewSheet");
        return true;
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", closeSheet);
        return () => backHandler.remove();
    }, [closeSheet]);

    const handleApply = () => {
        applyWallpaper(wallpaper);
        hideSheet("WallpaperPreviewSheet");
    };

    const handleClear = () => {
        clearWallpaper();
        hideSheet("WallpaperPreviewSheet");
    };

    const handleDelete = () => {
        if (wallpaper.isBuiltin) return;

        const category = categories.find(cat =>
            cat.wallpapers.some(w => w.name === wallpaper.name)
        );

        if (category) {
            deleteWallpaper(category.name, wallpaper.name);
            hideSheet("WallpaperPreviewSheet");
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: wallpaper.image }}
                style={[styles.image, { opacity, width: screenWidth, height: screenHeight }]}
                blurRadius={blurAmount}
                resizeMode="cover"
            />

            <View style={styles.controls}>
                <Text>Opacity: {opacity.toFixed(2)}</Text>
                <Slider
                    value={opacity}
                    minimumValue={0.1}
                    maximumValue={1}
                    step={0.01}
                    onValueChange={setOpacity}
                />

                <Text>Blur: {blurAmount.toFixed(0)}px</Text>
                <Slider
                    value={blurAmount}
                    minimumValue={0}
                    maximumValue={10}
                    step={.1}
                    onValueChange={setBlurAmount}
                />

                <View style={styles.buttonsRow}>
                    <Button text="Apply" onPress={handleApply} />
                    <Button text="Clear" onPress={handleClear} disabled={!isActive} />
                    {!wallpaper.isBuiltin && (
                        <Button text="Delete" color="danger" onPress={handleDelete} />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    image: { position: "absolute", top: 0, left: 0 },
    controls: {
        position: "absolute",
        bottom: 32,
        left: 16,
        right: 16,
        gap: 12,
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
    },
});