import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import FastImage from "react-native-fast-image";
import { Button, TextInput, Slider, Text } from "@components/Discord";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";
import { hideSheet } from "@components/utils/sheets";
import { showToast } from "@api/toasts";
import { useWallpaperStore } from "../../../../../plugins/_core/wallpapers/stores/wallpaperStore";
import * as DocumentPicker from "react-native-document-picker";

interface ImageSelection {
    uri: string;
    name: string;
}

export default function AddWallpaperSheet() {
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");
    const [image, setImage] = useState<ImageSelection | null>(null);
    const [opacity, setOpacity] = useState(1);
    const [blur, setBlur] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const addWallpaper = useWallpaperStore(state => state.addWallpaper);

    const handlePickImage = async () => {
        try {
            setIsProcessing(true);
            const result = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.images],
                copyTo: "documentDirectory",
            });

            if (!result.uri) {
                showToast("No file selected");
                return;
            }

            const finalUri = Platform.OS === 'android' && !result.uri.startsWith('file://')
                ? `file://${result.uri}`
                : result.uri;

            setImage({
                uri: finalUri,
                name: result.name || "Wallpaper",
            });
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                showToast("Failed to select image");
                console.error(err);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAdd = async () => {
        if (!image || !category.trim() || !name.trim()) {
            showToast("Please fill all fields");
            return;
        }

        try {
            setIsProcessing(true);
            addWallpaper(category, {
                name,
                image: image.uri,
                opacity,
                blur,
                isBuiltin: false,
            });
            showToast("Wallpaper added successfully!");
            hideSheet("AddWallpaperSheet");
        } catch (err) {
            showToast("Failed to add wallpaper");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Platform-specific blur implementation
    const renderBlurOverlay = () => {
        if (blur <= 0) return null;

        return (
            <View style={[styles.blurOverlay, {
                backgroundColor: `rgba(0,0,0,${blur / 40})`
            }]} />
        );
    };

    return (
        <BottomSheet>
            <View style={styles.container}>
                <TextInput
                    label="Category Name"
                    placeholder="e.g. Nature"
                    value={category}
                    onChange={setCategory}
                />

                <TextInput
                    label="Wallpaper Name"
                    placeholder="e.g. Sunset"
                    value={name}
                    onChange={setName}
                />

                <Button
                    text={image?.name || "Select Image"}
                    onPress={handlePickImage}
                    style={styles.selectButton}
                    loading={isProcessing}
                    disabled={isProcessing}
                />

                {image && (
                    <View style={styles.previewContainer}>
                        <FastImage
                            source={{ uri: image.uri }}
                            style={[styles.previewImage, { opacity }]}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                        {renderBlurOverlay()}
                    </View>
                )}

                <View style={styles.sliderContainer}>
                    <Text>Opacity: {opacity.toFixed(1)}</Text>
                    <Slider
                        value={opacity}
                        onValueChange={setOpacity}
                        minimumValue={0.1}
                        maximumValue={1}
                        step={0.1}
                    />
                </View>

                <View style={styles.sliderContainer}>
                    <Text>Blur: {blur.toFixed(0)}px</Text>
                    <Slider
                        value={blur}
                        onValueChange={setBlur}
                        minimumValue={0}
                        maximumValue={20}
                        step={1}
                    />
                </View>

                <Button
                    text="Add Wallpaper"
                    onPress={handleAdd}
                    disabled={!image || !category || !name || isProcessing}
                    style={styles.addButton}
                    loading={isProcessing}
                />
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    previewContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
        marginVertical: 16,
        borderRadius: 8,
        overflow: 'hidden',
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
    sliderContainer: {
        marginVertical: 16,
    },
    selectButton: {
        marginTop: 8,
    },
    addButton: {
        marginTop: 24,
    },
});