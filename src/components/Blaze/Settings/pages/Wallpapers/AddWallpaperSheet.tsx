import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, TextInput, Slider } from "@components/Discord";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";
import { hideSheet } from "@components/utils/sheets";
import { useWallpaperStore } from "../../../../../plugins/_core/wallpapers/stores/wallpaperStore";
import * as DocumentPicker from "react-native-document-picker";
import * as DocumentsNew from "@react-native-documents/picker";

//const DocumentPicker = lookupByProps("pickSingle", "isCancel") as unknown as typeof import("react-native-document-picker");
//const DocumentsNew = lookupByProps("pick", "saveDocuments") as unknown as typeof import("@react-native-documents/picker");

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
                    type: DocumentPicker.types.images,
                    mode: "import",
                    copyTo: "documentDirectory",
                });
                if (file) {
                    setImage({
                        uri: file.fileCopyUri ? `file://${file.fileCopyUri}` : "",
                        name: file.name ?? "Unknown",
                    });
                }
            } else if (DocumentsNew?.pick) {
                // Use @react-native-documents/picker style
                const files = await DocumentsNew.pick({
                    type: DocumentsNew.types.images,
                    allowVirtualFiles: true,
                    mode: "import",
                });
                const firstFile = files[0];
                if (firstFile?.uri) {
                    const name = firstFile.name ?? "wallpaper.jpg";
                    const keptCopies = await DocumentsNew.keepLocalCopy({
                        files: [{ fileName: name, uri: firstFile.uri }],
                        destination: "documentDirectory",
                    });
                    const result = keptCopies[0];
                    if (result?.status === "success" && result.localUri) {
                        setImage({
                            uri: `file://${result.localUri}`,
                            name,
                        });
                    }
                }
            }
        } catch (e) {
            if (DocumentPicker?.isCancel && DocumentPicker.isCancel(e)) {
                // User cancelled picker - do nothing
            } else {
                console.error(e);
            }
        }
    };

    const handleAdd = () => {
        if (!image || !category || !name) return;

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

                <View style={{ marginVertical: 16 }}>
                    <Text>Opacity: {opacity.toFixed(1)}</Text>
                    <Slider
                        value={opacity}
                        onValueChange={setOpacity}
                        minimumValue={0.1}
                        maximumValue={1}
                        step={0.1}
                    />
                </View>

                <View style={{ marginVertical: 16 }}>
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
});