import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, Image } from "react-native";
import { Button, TextInput, Slider } from "@components/Discord";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";
import { hideSheet } from "@components/utils/sheets";
import { useWallpaperStore } from "@plugins/_core/wallpapers/stores/wallpaperStore";
import * as DocumentPicker from "react-native-document-picker";
import { fileExists } from "@api/fs";
import { showToast } from "@api/toasts";

export default function AddWallpaperSheet() {
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");
    const [image, setImage] = useState<{ uri: string; name: string } | null>(null);
    const [opacity, setOpacity] = useState(1);
    const [blur, setBlur] = useState(0);
    const [error, setError] = useState("");

    const addWallpaper = useWallpaperStore(state => state.addWallpaper);

    const handlePickImage = async () => {
        try {
            setError("");
            const result = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.images],
                copyTo: "documentDirectory",
            });

            if (!result.uri) {
                throw new Error("No file selected");
            }

            // Using your existing @api/fs module
            const exists = await fileExists(result.uri);
            if (!exists) {
                throw new Error("Cannot access selected file");
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
                setError("Failed to select image");
                console.error(err);
            }
        }
    };

    const handleAdd = async () => {
        if (!image || !category.trim() || !name.trim()) {
            setError("Please fill all fields");
            return;
        }

        try {
            // Using your existing @api/fs module
            const exists = await fileExists(image.uri);
            if (!exists) {
                throw new Error("Image file no longer available");
            }

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
            setError("Failed to add wallpaper");
            console.error(err);
        }
    };

    return (
        <BottomSheet>
            <View style={styles.container}>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

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
                />

                {image && (
                    <Image
                        source={{ uri: image.uri }}
                        style={[styles.preview, { opacity }]}
                        resizeMode="contain"
                    />
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
                    disabled={!image || !category || !name}
                    style={styles.addButton}
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
    selectButton: {
        marginTop: 8,
    },
    addButton: {
        marginTop: 24,
    },
    preview: {
        width: '100%',
        height: 150,
        marginVertical: 8,
        borderRadius: 8,
    },
    errorText: {
        color: 'red',
        marginBottom: 8,
    },
    sliderContainer: {
        marginVertical: 16,
    },
});