import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
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

    const addWallpaper = useWallpaperStore(state => state.addWallpaper);

    const handlePickImage = async () => {
        try {
            if (DocumentPicker?.pickSingle) {
                // Use react-native-document-picker style
                const file = await DocumentPicker.pickSingle({
                    type: [DocumentPicker.types.images],
                    mode: "open",
                });

                if (file) {
                    if (!file.uri) {
                        Alert.alert("Error", "Failed to get file URI");
                        return;
                    }

                    setImage({
                        uri: file.uri,
                        name: file.name ?? "Unknown",
                    });
                }
            } else if (DocumentsNew?.pick) {
                // Use @react-native-documents/picker style
                const files = await DocumentsNew.pick({
                    type: [DocumentsNew.types.images],
                    allowVirtualFiles: true,
                    mode: "open",
                });

                const firstFile = files[0];
                if (firstFile?.uri) {
                    const name = firstFile.name ?? "wallpaper.jpg";
                    let finalUri = firstFile.uri;

                    try {
                        const keptCopies = await DocumentsNew.keepLocalCopy({
                            files: [{ fileName: name, uri: firstFile.uri }],
                            destination: "documentDirectory",
                        });

                        const result = keptCopies[0];
                        if (result?.status === "success" && result.localUri) {
                            finalUri = result.localUri;
                        }
                    } catch (copyError) {
                        console.warn("Failed to create local copy, using original:", copyError);
                    }

                    setImage({
                        uri: finalUri.startsWith("file://") ? finalUri : `file://${finalUri}`,
                        name,
                    });
                }
            }
        } catch (e) {
            // Handle cancellation differently for each picker
            if (DocumentPicker?.isCancel && DocumentPicker.isCancel(e)) {
                // User cancelled react-native-document-picker
                return;
            }

            if (e instanceof Error && e.message.includes("User cancelled")) {
                // User cancelled @react-native-documents/picker
                return;
            }

            console.error("Image picker error:", e);
            Alert.alert("Error", "Failed to select image");
        }
    };

    const handleAdd = () => {
        if (!image || !category || !name) return;

        if (!image.uri) {
            Alert.alert("Error", "Invalid image URI");
            return;
        }

        addWallpaper(category, {
            name,
            image: image.uri,
            opacity,
            blur,
            isBuiltin: false,
        });
        hideSheet("AddWallpaperSheet");
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
                    text={image?.name ?? "Select Image"}
                    onPress={handlePickImage}
                    style={styles.selectButton}
                />

                {image && (
                    <Text style={styles.imageInfo}>
                        Selected: {image.name}
                    </Text>
                )}

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
    imageInfo: {
        fontSize: 12,
        color: "#999",
        marginTop: -8,
    },
});