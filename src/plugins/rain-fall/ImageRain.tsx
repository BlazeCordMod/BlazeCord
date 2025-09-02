import React from "react";
import { Animated, Dimensions, Image, View } from "react-native";

interface ImageRainProps {
    imageUri: string;
    leafCount: number;
}

interface Leaf {
    x: number;
    y: Animated.Value;
    speed: number;
    size: number;
}

export default class ImageRain {
    private props: ImageRainProps;
    private leaves: Leaf[] = [];
    private running = false;

    constructor(props: ImageRainProps) {
        this.props = props;
        const { width, height } = Dimensions.get("window");
        for (let i = 0; i < props.leafCount; i++) {
            this.leaves.push({
                x: Math.random() * width,
                y: new Animated.Value(Math.random() * height),
                speed: 1 + Math.random() * 3,
                size: 30 + Math.random() * 30,
            });
        }
    }

    start() {
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
    }

    private animate() {
        if (!this.running) return;
        const { height } = Dimensions.get("window");
        this.leaves.forEach(leaf => {
            Animated.timing(leaf.y, {
                toValue: height,
                duration: 10000 / leaf.speed,
                useNativeDriver: true,
            }).start(() => {
                leaf.y.setValue(-leaf.size);
                if (this.running) this.animate();
            });
        });
    }

    render() {
        return (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                {this.leaves.map((leaf, i) => (
                    <Animated.Image
                        key={i}
                        source={require("@assets/weed.png")}
                        style={{
                            position: "absolute",
                            left: leaf.x,
                            top: leaf.y,
                            width: leaf.size,
                            height: leaf.size,
                        }}
                    />
                ))}
            </View>
        );
    }
}