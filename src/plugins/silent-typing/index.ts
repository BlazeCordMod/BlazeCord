
import { definePlugin } from "#plugin-context";
import { showToast } from "@api/toasts";
import { Devs } from "@data/constants";

const toast = showToast("Currently Typing...").hide();

export default definePlugin({
    name: "Stealth Mode",
    description: "Prevents you from showing \"is typing...\".",
    authors: [Devs.Blaze],

    flux: {
        TYPING_START_LOCAL: () => {
            // Always block typing indicators when plugin is enabled
            return false;
            // Removed settings check - plugin enable/disable controls it completely
        },
    },
});