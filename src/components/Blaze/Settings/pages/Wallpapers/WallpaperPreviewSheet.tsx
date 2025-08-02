import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native'; // Added Platform import
import FastImage from 'react-native-fast-image';
import { Button, Slider, Text } from '@components/Discord';
import { hideSheet } from '@components/utils/sheets';
import { showToast } from '@api/toasts';
import { useWallpaperStore } from '@plugins/_core/wallpapers/stores/wallpaperStore';
import type { Wallpaper } from '@plugins/_core/wallpapers/stores/wallpaperStore';

interface Props {
    wallpaper: Wallpaper;
}

export default function WallpaperPreviewSheet({ wallpaper: initialWallpaper }: Props) {
    const { applyWallpaper, deleteWallpaper, categories } = useWallpaperStore();
    const [isProcessing, setIsProcessing] = useState(false);

    // Local state for live preview
    const [previewSettings, setPreviewSettings] = useState({
        blur: initialWallpaper.blur ?? 0,
        opacity: initialWallpaper.opacity ?? 1
    });

    const handleApply = async () => {
        try {
            setIsProcessing(true);
            await applyWallpaper({
                ...initialWallpaper,
                blur: previewSettings.blur,
                opacity: previewSettings.opacity
            });
            showToast('Wallpaper applied!');
            hideSheet('WallpaperPreviewSheet');
        } catch (err) {
            showToast('Failed to apply wallpaper');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsProcessing(true);
            const category = categories.find(cat =>
                cat.wallpapers.some(w => w.name === initialWallpaper.name)
            );

            if (category) {
                await deleteWallpaper(category.name, initialWallpaper.name);
                showToast('Wallpaper deleted');
            }
            hideSheet('WallpaperPreviewSheet');
        } catch (err) {
            showToast('Failed to delete wallpaper');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Platform-specific blur effect
    const blurStyle = Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOpacity: previewSettings.blur / 20,
            shadowRadius: previewSettings.blur / 2
        },
        android: {
            backgroundColor: `rgba(0,0,0,${previewSettings.blur / 40})`
        },
        default: {} // Web/default case
    });

    return (
        <View style={styles.container}>
            {/* Preview Section */}
            <View style={styles.previewContainer}>
                <FastImage
                    source={{ uri: initialWallpaper.image }}
                    style={[
                        styles.previewImage,
                        {
                            opacity: previewSettings.opacity,
                            ...blurStyle
                        }
                    ]}
                    resizeMode="cover"
                />
            </View>

            {/* Controls Section */}
            <View style={styles.controlsContainer}>
                <View style={styles.sliderGroup}>
                    <Text>Opacity: {previewSettings.opacity.toFixed(1)}</Text>
                    <Slider
                        value={previewSettings.opacity}
                        onValueChange={val => setPreviewSettings(p => ({ ...p, opacity: val }))}
                        minimumValue={0.1}
                        maximumValue={1}
                        step={0.1}
                    />
                </View>

                <View style={styles.sliderGroup}>
                    <Text>Blur: {previewSettings.blur.toFixed(0)}px</Text>
                    <Slider
                        value={previewSettings.blur}
                        onValueChange={val => setPreviewSettings(p => ({ ...p, blur: val }))}
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
        backgroundColor: '#000',
    },
    previewContainer: {
        flex: 2,
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    controlsContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-evenly',
    },
    sliderGroup: {
        marginVertical: 8,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
    }
});