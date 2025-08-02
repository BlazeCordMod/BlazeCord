import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Platform, Image, BackHandler } from "react-native";
import { Button, Slider, Text } from "@components/Discord";
import { hideSheet } from "@components/utils/sheets";
import { showToast } from "@api/toasts";
import { useWallpaperStore } from "@plugins/_core/wallpapers/stores/wallpaperStore";
import type { Wallpaper } from "@plugins/_core/wallpapers/stores/wallpaperStore";

interface Props {
    wallpaper: Wallpaper;
}

export default function WallpaperPreviewSheet({ wallpaper: initialWallpaper }: Props) {
    const { applyWallpaper, deleteWallpaper, clearWallpaper, categories } = useWallpaperStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [imageError, setImageError] = useState(false);

    const [previewSettings, setPreviewSettings] = useState({
        blur: initialWallpaper?.blur || 0,
        opacity: initialWallpaper?.opacity || 1
    });

    const closeSheet = useCallback(() => hideSheet("WallpaperPreviewSheet"), []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            closeSheet();
            return true;
        });

        return () => backHandler.remove();
    }, [closeSheet]);

    const blurStyle = Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: previewSettings.blur / 20,
            shadowRadius: previewSettings.blur / 2,
            backgroundColor: "rgba(0,0,0,0.1)"
        },
        android: {
            elevation: previewSettings.blur,
            backgroundColor: `rgba(0,0,0,${previewSettings.blur / 40})`
        },
        default: {}
    });

    const handleAction = async (action: () => void | Promise<void>, toastMsg: string) => {
        try {
            setIsProcessing(true);
            await action();
            showToast(toastMsg);
            closeSheet();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApply = () =>
        handleAction(() => {
            applyWallpaper({
                ...initialWallpaper,
                blur: previewSettings.blur,
                opacity: previewSettings.opacity
            });
        }, "Wallpaper applied!");

    const handleClear = () => handleAction(clearWallpaper, "Wallpaper cleared");

    const handleDelete = () =>
        handleAction(() => {
            const category = categories.find(cat =>
                cat.wallpapers.some(w => w.name === initialWallpaper.name)
            );
            if (category) {
                deleteWallpaper(category.name, initialWallpaper.name);
            }
        }, "Wallpaper deleted");

    return (
        <View style={styles.container}>
            <View style={styles.previewContainer}>
                <View style={[styles.blurContainer, blurStyle]}>
                    <Image
                        source={{ uri: initialWallpaper.image }}
                        style={[styles.previewImage, { opacity: previewSettings.opacity }]}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                </View>
            </View>

            <View style={styles.controlsContainer}>
                <View style={styles.sliderGroup}>
                    <Text>Opacity: {previewSettings.opacity.toFixed(1)}</Text>
                    <Slider
                        value={previewSettings.opacity}
                        onValueChange={val =>
                            setPreviewSettings(p => ({ ...p, opacity: val }))
                        }
                        minimumValue={0.1}
                        maximumValue={1}
                        step={0.1}
                    />
                </View>

                <View style={styles.sliderGroup}>
                    <Text>Blur: {previewSettings.blur.toFixed(0)}px</Text>
                    <Slider
                        value={previewSettings.blur}
                        onValueChange={val =>
                            setPreviewSettings(p => ({ ...p, blur: val }))
                        }
                        minimumValue={0}
                        maximumValue={20}
                        step={1}
                    />
                </View>

                <View style={styles.buttonGroup}>
                    <Button
                        text="Apply"
                        onPress={handleApply}
                        loading={isProcessing}
                        disabled={isProcessing}
                        style={styles.button}
                    />
                    <Button
                        text="Clear"
                        onPress={handleClear}
                        loading={isProcessing}
                        disabled={isProcessing}
                        style={styles.button}
                    />
                    {!initialWallpaper.isBuiltin && (
                        <Button
                            text="Delete"
                            color="danger"
                            onPress={handleDelete}
                            loading={isProcessing}
                            disabled={isProcessing}
                            style={styles.button}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000"
    },
    previewContainer: {
        flex: 2,
        justifyContent: "center",
        overflow: "hidden"
    },
    blurContainer: {
        width: "100%",
        height: "100%",
        overflow: "hidden"
    },
    previewImage: {
        width: "100%",
        height: "100%"
    },
    controlsContainer: {
        flex: 1,
        padding: 16,
        justifyContent: "space-evenly"
    },
    sliderGroup: {
        marginVertical: 8
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16
    },
    button: {
        flex: 1,
        marginHorizontal: 4
    }
});