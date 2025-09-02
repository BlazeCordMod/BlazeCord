import { Image } from "react-native";

// Option 1: Use require() directly
export const BlazecordIcon = () => (
    <Image
        source={require("@assets/ic_blazecord.png")}
        style={{ width: 20, height: 20 }}
        resizeMode="contain"
    />
);

export default BlazecordIcon;