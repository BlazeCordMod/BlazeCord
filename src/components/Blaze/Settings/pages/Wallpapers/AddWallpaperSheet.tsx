import { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { Button, Text, TextInput } from "@components/Discord";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";
import { hideSheet } from "@components/utils/sheets";
import { useWallpaperStore } from "@plugins/_core/wallpapers/stores/wallpaperStore";
import * as DocumentPicker from "react-native-document-picker";
import * as DocumentsNew from "@react-native-documents/picker";

export default function AddWallpaperSheet() {
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");
    const [image, setImage] = useState<{ uri: string; name: string } | null>(null);
    const [opacity, setOpacity] = useState(1);
    const [blur, setBlur] = useState(0);
    const [isPicking, setIsPicking] = useState(false);

    const addWallpaper = useWallpaperStore(state => state.addWallpaper);

    const handlePickImage = async () => {
        if (isPicking) return;
        setIsPicking(true);

        try {
            if (DocumentPicker?.pickSingle) {
                const file = await DocumentPicker.pickSingle({
                    type: [DocumentPicker.types.images],
                    mode: "import",
                    copyTo: "documentDirectory",
                });

                if (file) {
                    const imageUri = file.fileCopyUri || file.uri;
                    if (!imageUri) {
                        Alert.alert("Error", "Failed to get file URI");
                        return;
                    }

                    setImage({
                        uri: imageUri.startsWith("file://") ? imageUri : `file://${imageUri}`,
                        name: file.name ?? "Unknown",
                    });
                }
            } else if (DocumentsNew?.pick) {
                const files = await DocumentsNew.pick({
                    type: [DocumentsNew.types.images],
                    allowVirtualFiles: true,
                    mode: "import",
                });

                const firstFile = files[0];
                if (firstFile?.uri) {
                    const fileName = firstFile.name ?? "wallpaper.jpg";
                    try {
                        const keptCopies = await DocumentsNew.keepLocalCopy({
                            files: [{ fileName, uri: firstFile.uri }],
                            destination: "documentDirectory",
                        });

                        const result = keptCopies[0];
                        if (result?.status === "success" && result.localUri) {
                            setImage({
                                uri: result.localUri.startsWith("file://") ? result.localUri : `file://${result.localUri}`,
                                name: fileName,
                            });
                        } else {
                            setImage({
                                uri: firstFile.uri.startsWith("file://") ? firstFile.uri : `file://${firstFile.uri}`,
                                name: fileName,
                            });
                            console.warn("Using original URI, copy may not be permanent");
                        }
                    } catch (copyError) {
                        console.warn("Failed to create local copy:", copyError);
                        setImage({
                            uri: firstFile.uri.startsWith("file://") ? firstFile.uri : `file://${firstFile.uri}`,
                            name: fileName,
                        });
                    }
                }
            }
        } catch (e) {
            if (DocumentPicker?.isCancel && DocumentPicker.isCancel(e)) {
                // User cancelled - silent return
                return;
            }

            if (e instanceof Error && e.message.includes("User cancelled")) {
                // User cancelled - silent return
                return;
            }

            console.error("Image picker error:", e);
            Alert.alert("Error", "Failed to select image");
        } finally {
            setIsPicking(false);
        }
    };

    const handleAdd = () => {
        if (!image || !category.trim() || !name.trim()) {
            Alert.alert("Error", "Please fill all fields and select an image");
            return;
        }

        if (!image.uri) {
            Alert.alert("Error", "Invalid image URI");
            return;
        }

        addWallpaper(category.trim(), {
            name: name.trim(),
            image: image.uri,
            opacity,
            blur,
            isBuiltin: false,
        });

        // Reset form
        setCategory("");
        setName("");
        setImage(null);
        setOpacity(1);
        setBlur(0);
        hideSheet("AddWallpaperSheet");
    };

    const clearImage = () => {
        setImage(null);
    };

    return (
        <BottomSheet>
            <View style={styles.container}>
                <Text style={styles.title}>Add New Wallpaper</Text>

                <TextInput
                    label="Category Name"
                    placeholder="e.g. Nature"
                    value={category}
                    onChange={setCategory}
                    style={styles.input} />

                <TextInput
                    label="Wallpaper Name"
                    placeholder="e.g. Sunset"
                    value={name}
                    onChange={setName}
                    style={styles.input} />

                <Button
                    text={isPicking ? "Selecting..." : (image?.name ?? "Select Image")}
                    onPress={handlePickImage}
                    disabled={isPicking}
                    style={styles.selectButton} />

                {image && (
                    <View style={styles.imagePreview}>
                        <Image
                            source={{ uri: image.uri }}
                            style={styles.previewImage}
                            resizeMode="cover" />

                        <View style={styles.imageInfo}>
                            <Text style={styles.imageName}>Selected: {image.name}</Text>
                            <Button
                                text="Clear"
                                onPress={clearImage}
                                size="small"
                                style={styles.clearButton}
                                color="primary" />
                        </View>
                    </View>
                )}

                <Button
                    text="Add Wallpaper"
                    onPress={handleAdd}
                    disabled={!image || !category.trim() || !name.trim()}
                    style={styles.addButton}
                    color="primary"
                />
            </View>
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
        backgroundColor: "BACKGROUND_PRIMARY",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
        color: "HEADER_PRIMARY",
    },
    input: {
        marginBottom: 12,
        backgroundColor: "BACKGROUND_SECONDARY",
    },
    selectButton: {
        marginTop: 8,
        backgroundColor: "BACKGROUND_SECONDARY",
    },
    addButton: {
        marginTop: 24,
    },
    imagePreview: {
        marginTop: 12,
        alignItems: "center",
        backgroundColor: "BACKGROUND_SECONDARY",
        padding: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "BACKGROUND_MODIFIER_ACCENT",
    },
    previewImage: {
        width: 120,
        height: 200,
        borderRadius: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "BACKGROUND_MODIFIER_ACCENT",
    },
    imageInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    imageName: {
        fontSize: 14,
        color: "TEXT_MUTED",
        marginRight: 8,
    },
    clearButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
});