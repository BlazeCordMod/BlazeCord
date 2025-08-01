import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Button } from '@components/Discord';
import { hideSheet } from '@components/utils/sheets';
import { showToast } from '@api/toasts';
import { useWallpaperStore } from '@plugins/_core/wallpapers/stores/wallpaperStore';
import { BlurView } from '@react-native-community/blur';
import type { Wallpaper } from '@plugins/_core/wallpapers/stores/wallpaperStore';

interface Props {
    wallpaper: Wallpaper;
}

export default function WallpaperPreviewSheet({ wallpaper }: Props) {
    const { applyWallpaper, deleteWallpaper, categories } = useWallpaperStore();
    const [isProcessing, setIsProcessing] = useState(false);

    // Safe defaults for optional fields
    const currentBlur = wallpaper.blur ?? 0;
    const currentOpacity = wallpaper.opacity ?? 1;

    const handleApply = async () => {
        try {
            setIsProcessing(true);
            await applyWallpaper(wallpaper);
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
                cat.wallpapers.some(w => w.name === wallpaper.name)
            );

            if (category) {
                await deleteWallpaper(category.name, wallpaper.name);
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

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <FastImage
                    source={{ uri: wallpaper.image }}
                    style={[styles.previewImage, { opacity: currentOpacity }]}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {currentBlur > 0 && (
                    <BlurView
                        style={styles.blurOverlay}
                        blurType="light"
                        blurAmount={currentBlur * 2}
                        reducedTransparencyFallbackColor="white"
                    />
                )}
            </View>

            <View style={styles.controls}>
                <Button
                    text="Apply"
                    onPress={handleApply}
                    loading={isProcessing}
                    disabled={isProcessing}
                />
                {!wallpaper.isBuiltin && (
                    <Button
                        text="Delete"
                        color="danger"
                        onPress={handleDelete}
                        loading={isProcessing}
                        disabled={isProcessing}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        paddingBottom: 24,
    },
});