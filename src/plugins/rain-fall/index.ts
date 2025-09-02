import { definePlugin, definePluginSettings } from "#plugin-context";
import { Devs } from "@data/constants";
import MatrixRain from "./MatrixRain";
import ImageRain from "./ImageRain";

const settings = definePluginSettings({
    enabled: {
        type: "boolean",
        label: "Enable Blaze Rain",
        description: "Toggle the rain effect",
        default: true,
    },
    mode: {
        type: "radio",
        label: "Rain Mode",
        description: "Text or image rain",
        options: [
            { label: "Text Rain", value: "text" },
            { label: "Image Rain", value: "image" },
        ],
        default: "text",
    },
    chars: {
        type: "string",
        label: "Rain Characters",
        description: "Characters used in the text rain",
        default: "BlazeK1ng420",
    },
    color: { type: "string", label: "Text Color", default: "#7638B0" },
    charSize: { type: "slider", label: "Character Size", points: Array.from({ length: 31 }, (_, i) => (i + 10).toString()), default: "20" },
    trailLength: { type: "slider", label: "Trail Length", points: Array.from({ length: 19 }, (_, i) => (i + 2).toString()), default: "8" },
    speed: { type: "slider", label: "Animation Speed", points: Array.from({ length: 91 }, (_, i) => (i + 10).toString()), default: "34" },
    imageUri: { type: "string", label: "Rain Image", description: "Local asset or URL", default: "@assets/weed.png" },
    leafCount: { type: "slider", label: "Number of Leaves", points: Array.from({ length: 96 }, (_, i) => (i + 5).toString()), default: "30" },
});

let rainInstance: MatrixRain | ImageRain | null = null;

export default definePlugin({
    name: "Rain Maker",
    description: "Matrix-style text or image rain over Discord",
    authors: [Devs.Blaze],
    patches: [],

    start() {
        if (!settings.get().enabled) return false;

        if (settings.get().mode === "image") {
            rainInstance = new ImageRain({
                imageUri: settings.get().imageUri,
                leafCount: Number(settings.get().leafCount),
            });
        } else {
            rainInstance = new MatrixRain({
                chars: settings.get().chars,
                color: settings.get().color,
                charSize: Number(settings.get().charSize),
                trailLength: Number(settings.get().trailLength),
                speed: Number(settings.get().speed),
            });
        }

        rainInstance.start();
    },

    stop() {
        rainInstance?.stop();
        rainInstance = null;
    },
});