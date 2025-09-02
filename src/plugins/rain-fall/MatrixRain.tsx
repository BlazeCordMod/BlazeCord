import React from "react";
import { Animated, Dimensions, Text, View } from "react-native";

interface MatrixRainProps {
    chars: string;
    color: string;
    charSize: number;
    trailLength: number;
    speed: number;
}

interface Drop {
    x: number;
    y: Animated.Value;
}

export default class MatrixRain {
    private props: MatrixRainProps;
    private drops: Drop[] = [];
    private running = false;

    constructor(props: MatrixRainProps) {
        this.props = props;
        const { width, height } = Dimensions.get("window");
        const columns = Math.floor(width / props.charSize);
        for (let i = 0; i < columns; i++) {
            this.drops.push({ x: i * props.charSize, y: new Animated.Value(Math.random() * height) });
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
        this.drops.forEach(drop => {
            Animated.timing(drop.y, {
                toValue: height,
                duration: this.props.speed * 50,
                useNativeDriver: true,
            }).start(() => {
                drop.y.setValue(-this.props.charSize * this.props.trailLength);
                if (this.running) this.animate();
            });
        });
    }

    render() {
        return (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                {this.drops.map((drop, i) => (
                    <Animated.Text
                        key={i}
                        style={{
                            position: "absolute",
                            left: drop.x,
                            top: drop.y,
                            color: this.props.color,
                            fontSize: this.props.charSize,
                        }}
                    >
                        {this.props.chars[Math.floor(Math.random() * this.props.chars.length)]}
                    </Animated.Text>
                ))}
            </View>
        );
    }
}