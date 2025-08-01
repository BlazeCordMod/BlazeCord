import { type ApplicationCommand } from "../types";
import { messageUtil } from "@metro/common/libraries";
import usePluginStore from "@stores/usePluginStore"; // Import the default export

export default () => <ApplicationCommand>{
    name: "stealth",
    description: "Toggle Stealth Mode plugin state",
    options: [], // No options - always ephemeral
    execute(_, ctx) {
        const PLUGIN_ID = "Stealth Mode"; // Must match your plugin's name exactly
        const pluginStore = usePluginStore.getState();

        // Toggle the plugin state
        pluginStore.togglePlugin(PLUGIN_ID);
        const isEnabled = pluginStore.settings[PLUGIN_ID]?.enabled;

        // Always send ephemeral response
        messageUtil.sendBotMessage(
            ctx.channel.id,
            `Stealth Mode ${isEnabled ? "ENABLED" : "DISABLED"}`
        );
    }
};