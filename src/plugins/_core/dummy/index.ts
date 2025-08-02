import { definePlugin, definePluginSettings } from "#plugin-context";
import { Devs } from "@data/constants";
import { byProps } from "@metro/common/filters";
import { FoodIcon } from "@metro/common/icons";

const settings = definePluginSettings({
    stonerName: {
        type: "string",
        label: "Stoner Name",
        description: "What's your stoner alias?",
        placeholder: "BlazeyMcBluntface",
        validate: (value: string) => {
            return Boolean(value.match(/^[a-zA-Z]+$/));
        },
    },
    gotMunchies: {
        type: "boolean",
        label: "Got the Munchies?",
        description: "Are you feeling snacky right now?",
        icon: "FoodIcon", // optional — swap for a fun weed/munchies-related icon if available
    },
    favoriteStrain: {
        type: "select",
        label: "Favorite Strain",
        description: "Pick your go-to strain vibe.",
        options: [
            {
                label: "Sativa",
                description: "Energetic and uplifting — great for day sessions.",
                value: "sativa",
            },
            {
                label: "Indica",
                description: "Chill and couch-locked — perfect for lazy nights.",
                value: "indica",
            },
            {
                label: "Hybrid",
                description: "A little bit of both. Balanced buzz.",
                value: "hybrid",
            },
            {
                label: "CBD Only",
                description: "No high, just vibes and relaxation.",
                value: "cbd",
            },
        ],
    },
    smokeSchedule: {
        type: "radio",
        label: "Smoke Schedule",
        description: "How often do you toke?",
        options: [
            {
                label: "Wake 'n Bake",
                description: "Start the day blazed.",
                value: "morning",
            },
            {
                label: "Night Owl",
                description: "Only toke after dark.",
                value: "night",
            },
            {
                label: "All Day Erry Day",
                description: "Perma-stoned, baby.",
                value: "always",
            },
        ],
    },
    highLevel: {
        type: "slider",
        label: "How High Are You?",
        description: "Adjust your current baked level.",
        points: ["Sober", "Buzzin'", "Lifted", "Gone", "Interdimensional"],
        default: "Buzzin'",
    },
});

if (__DEV__) {
    window.sampleMethod = () => {
        return "this method is unpatched";
    };
}

export default definePlugin({
    name: "Dummy",
    description: "Its a dummy, like you!.",
    authors: [Devs.Blaze],

    isAvailable: () => __DEV__,

    patches: [
        {
            id: "sample-patch",
            predicate: () => settings.get().gotMunchies === true,
            target: byProps(["toString"]), // This matches almost all modules lol
            patch(_, patcher) {
                patcher.after(window, "sampleMethod", () => {
                    return "this method is patched";
                });
            },
        },
    ],

    start() {
        // console.log({
        //     settings
        // })
    },
});
