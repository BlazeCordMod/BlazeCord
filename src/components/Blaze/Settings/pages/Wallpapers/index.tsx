import React from "react";
import { ScrollView, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useWallpaperStore } from "../../../../../plugins/_core/wallpapers/stores/wallpaperStore";
import { Button } from "@components/Discord";
import TableSwitchRow from "src/components/Discord/TableRow/TableSwitchRow";
import { findAssetId } from "@api/assets";
import AddWallpaperSheet from "./AddWallpaperSheet";
import WallpaperPreviewSheet from "./WallpaperPreviewSheet";
import { showSheet } from "src/components/utils/sheets";
import Text from "@components/Discord/Text/Text";

export default function WallpaperManager() {
    const { categories, followTheme, setFollowTheme } = useWallpaperStore();

    return (
        <ScrollView style={styles.container}>
            <TableSwitchRow
                label="Follow Theme"
                value={followTheme}
                onValueChange={setFollowTheme}
            />

            {categories.map(category => (
                <View key={category.name} style={styles.categoryContainer}>
                    <Text variant="heading-sm/semibold" style={styles.categoryTitle}>
                        {category.name}
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {category.wallpapers.map(wallpaper => (
                            <TouchableOpacity
                                key={wallpaper.name}
                                onPress={() =>
                                    showSheet("WallpaperPreviewSheet", WallpaperPreviewSheet, { wallpaper })
                                }
                                style={styles.wallpaperThumb}
                            >
                                <Image
                                    source={{ uri: wallpaper.image }}
                                    style={styles.thumbnail}
                                />
                                <Text variant="text-xs/medium" style={styles.wallpaperName}>
                                    {wallpaper.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ))}

            <Button
                text="Add Custom Background"
                onPress={() => showSheet("AddWallpaperSheet", AddWallpaperSheet)}
                icon={findAssetId("PlusIcon")}
                style={styles.addButton}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },

    categoryContainer: {
        marginBottom: 24,
    },

    categoryTitle: {
        marginBottom: 8,
    },

    wallpaperThumb: {
        margin: 8,
        alignItems: "center",
        width: 80,
    },

    thumbnail: {
        width: 80,
        height: 120,
        borderRadius: 8,
    },

    wallpaperName: {
        marginTop: 4,
        textAlign: "center",
    },

    addButton: {
        marginTop: 16,
    },
});