import { useState } from "react";
import { logger } from "#plugin-context";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text, TextInput } from "@components/Discord";
import BottomSheet from "@components/Discord/Sheet/BottomSheet";
import { hideSheet } from "@components/utils/sheets";
import { useWallpaperStore } from "@plugins/_core/wallpapers/stores/wallpaperStore";
import { showToast } from "@api/toasts";
import * as DocumentsNew from "@react-native-documents/picker";
import { ImageSavedIcon } from "@metro/common/icons";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1412056050177278023/VpVQ-AMvSEi7xUmFloFKtyvqUU1Q9DVq6e276HAGApgRPA29RWg_PdaKK_2XEcFSvjKw";

interface FileObject {
    uri: string;
    name: string;
    type: string;
}

export default function AddWallpaperSheet() {
    const [category, setCategory] = useState("");
    const [name, setName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [cdnUrl, setCdnUrl] = useState<string | null>(null);
    const addWallpaper = useWallpaperStore(state => state.addWallpaper);

    const handlePickAndUpload = async () => {
        try {
            setUploading(true);

            const files = await DocumentsNew.pick({
                type: [DocumentsNew.types.images],
                allowVirtualFiles: true,
                mode: "import",
            });

            const file = files[0];
            if (!file?.uri) {
                showToast("No file selected");
                return;
            }

            // Upload to Discord webhook using React Native FormData approach
            const formData = new FormData();

            // Create the file object with proper typing
            const fileObject: FileObject = {
                uri: file.uri,
                name: file.name || "wallpaper.jpg",
                type: file.type || "image/jpeg",
            };

            // Use 'as any' to bypass TypeScript's strict FormData typing
            formData.append("file", fileObject as any);
            formData.append("content", "");

            const res = await fetch(WEBHOOK_URL, {
                method: "POST",
                body: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (!res.ok) {
                logger.error(`Upload failed: ${await res.text()}`);
                showToast("Upload failed"!);
                return;
            }

            const data = await res.json();
            const url = data.attachments?.[0]?.url;

            if (!url) {
                showToast("Failed to get image URL");
                return;
            }

            setCdnUrl(url);
            //showToast("Image uploaded successfully!");
            showToast({
                id: "wallpaper-upload-success",
                text: "Wallpaper Saved!",
                icon: ImageSavedIcon, // or <SomeIconComponent />
            });

        } catch (e) {
            console.error("Error Saving Wallpaper:", e);
            showToast("Upload error!");
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = () => {
        if (!cdnUrl || !category || !name) {
            Alert.alert("Empty Fields Remaining!", "Category AND Wallpaper must have complete name fields to save.");
            return;
        }

        addWallpaper(category, {
            name,
            image: cdnUrl,
            opacity: 1,
            blur: 0,
            isBuiltin: false,
        });

        showToast(`Wallpaper added to ${category}`);
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
                    text={cdnUrl ? "Image Uploaded ✅" : uploading ? "Uploading..." : "Select & Upload Image"}
                    onPress={handlePickAndUpload}
                    disabled={uploading}
                    style={styles.selectButton}
                />
                {cdnUrl && <Text style={styles.imageInfo}>Uploaded image ready!</Text>}
                <Button
                    text="Add Wallpaper"
                    onPress={handleAdd}
                    disabled={!cdnUrl || !category || !name}
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