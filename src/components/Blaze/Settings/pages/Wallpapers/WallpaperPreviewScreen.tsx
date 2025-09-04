import { View, Image, StyleSheet, Dimensions } from "react-native";
import { useState } from "react";
import { Button, Slider, Text } from "@components/Discord";
import { useWallpaperStore } from "@plugins/_core/wallpapers/stores/wallpaperStore";
import type { Wallpaper } from "@plugins/_core/wallpapers/stores/wallpaperStore";
import { NavigationNative } from "@metro/common/libraries";
import { showToast } from "@api/toasts";
import { ImageIcon, RefreshIcon, TrashIcon } from "@metro/common/icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Props { wallpaper: Wallpaper }

export default function WallpaperPreviewScreen({ wallpaper }: Props) {
    const navigation = NavigationNative.useNavigation();
    const {
        appliedWallpaper,
        blurAmount,
        opacity,
        applyWallpaper,
        clearWallpaper,
        deleteWallpaper,
        setBlurAmount,
        setOpacity,
        categories,
    } = useWallpaperStore();

    const isActive = appliedWallpaper?.name === wallpaper.name;

    // Convert slider value to exponential blur amount
    const exponentialBlur = (value: number) => {
        return Math.pow(value, 1.5); // More gentle curve than squared
    };

    // Convert blur amount back to slider value (for initial state)
    const sliderToBlur = (blur: number) => {
        return Math.pow(blur, 1 / 1.5);
    };

    const [sliderValue, setSliderValue] = useState(sliderToBlur(blurAmount));

    // Update the actual blur amount when slider changes
    const handleSliderChange = (value: number) => {
        setSliderValue(value);
        setBlurAmount(exponentialBlur(value));
    };

    const handleApply = () => {
        applyWallpaper(wallpaper);
        showToast({
            id: "wallpaper-set",
            text: "Wallpaper Set!",
            icon: ImageIcon,
        });
        navigation.goBack();
    };

    const handleClear = () => {
        clearWallpaper();
        showToast({
            id: "wallpaper-cleared",
            text: "Wallpaper Cleared!",
            icon: RefreshIcon,
        });
        navigation.goBack();
    };

    const handleDelete = () => {
        if (wallpaper.isBuiltin) return;

        const category = categories.find(cat =>
            cat.wallpapers.some(w => w.name === wallpaper.name)
        );

        if (category) {
            deleteWallpaper(category.name, wallpaper.name);
            showToast({
                id: "wallpaper-deleted",
                text: "Wallpaper Deleted!",
                icon: TrashIcon,
            });
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: wallpaper.image }}
                style={[styles.image, { opacity, width: screenWidth, height: screenHeight }]}
                blurRadius={blurAmount}
                resizeMode="cover"
            />

            <View style={styles.controls}>
                <Text>Opacity: {opacity.toFixed(2)}</Text>
                <Slider
                    value={opacity}
                    minimumValue={0.1}
                    maximumValue={1}
                    step={0.01}
                    onValueChange={setOpacity}
                />

                <Text>Blur: {blurAmount.toFixed(1)}px</Text>
                <Slider
                    value={sliderValue}
                    minimumValue={0}
                    maximumValue={4} // Lower maximum due to exponential scaling
                    step={0.1}
                    onValueChange={handleSliderChange}
                />

                <View style={styles.buttonsRow}>
                    <Button text="Apply" onPress={handleApply} />
                    <Button text="Clear" onPress={handleClear} disabled={!isActive} />
                    {!wallpaper.isBuiltin && (
                        <Button text="Delete" color="danger" onPress={handleDelete} />
                    )}
                    <Button text="Back" onPress={() => navigation.goBack()} color="primary" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    image: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    controls: {
        position: "absolute",
        bottom: 48,
        left: 16,
        right: 16,
        gap: 12,
        padding: 16,
        borderRadius: 8,
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
        gap: 8,
    },
});