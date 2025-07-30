import { definePlugin, patcher } from "#plugin-context";
import { byProps } from "@metro/common/filters";
import { showToast } from "@api/toasts";
import { Devs } from "@data/constants";

let originalFreemiumAppIconIds: unknown;

export default definePlugin({
    name: "Unlock Nitro AppIcons",
    description: "Unlocks all AppIcons by spoofing Nitro checks.",
    authors: [Devs.Blaze],

    patches: [
        {
            id: "hack-app-icons",
            target: byProps(["getOfficialAlternateIcons", "getIcons", "getIconById"]),
            patch(module, patcher) {
                const altIcons = module.getOfficialAlternateIcons();
                const mainIcons = module.getIcons();

                // Unset premium flags
                altIcons.forEach((icon: Record<string, unknown>) => {
                    icon.isPremium = false;
                });
                mainIcons.forEach((icon: Record<string, unknown>) => {
                    icon.isPremium = false;
                });

                patcher.instead(module, "getIcons", () => mainIcons);
                patcher.instead(module, "getOfficialAlternateIcons", () => altIcons);
                patcher.after(module, "getIconById", (_args, ret: Record<string, unknown>) => {
                    ret.isPremium = false;
                    return ret;
                });
            },
        },
        {
            id: "hack-icon-ids",
            target: byProps(["FreemiumAppIconIds", "MasterAppIconIds"]),
            patch(module) {
                originalFreemiumAppIconIds = module.FreemiumAppIconIds;
                module.FreemiumAppIconIds = module.MasterAppIconIds;
            },
        },
    ],

    start() {
        if (!(globalThis as any).__appIconUnlockerActive) {
            showToast("🎨 App Icons Unlocked");
            (globalThis as any).__appIconUnlockerActive = true;
        }
    },

    cleanup() {
        const idModule = require("@metro/filters").lookup(byProps(["FreemiumAppIconIds", "MasterAppIconIds"]));
        if (originalFreemiumAppIconIds != null) {
            idModule.FreemiumAppIconIds = originalFreemiumAppIconIds;
        }
        delete (globalThis as any).__appIconUnlockerActive;
        showToast("🔒 App Icons Restored");
    }
});