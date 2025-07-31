import { type ApplicationCommand, ApplicationCommandOptionType } from "../types";
import { messageUtil } from "@metro/common/libraries";
import usePluginStore from "@stores/usePluginStore";

export default () => <ApplicationCommand>{
    name: "silent-typing",
    description: "Toggle Silent Typing on/off",
    options: [
        {
            name: "ephemeral",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: "Send ephemeral message (default: true)",
            required: false,
        },
    ],
    execute(args, ctx) {
        const ephemeralArg = args.find(arg => arg.name === "ephemeral");
        const ephemeral = ephemeralArg?.value ?? true;

        const current = usePluginStore.getState().settings.stealthTyping?.silentTypingActive ?? true;
        usePluginStore.getState().togglePlugin("stealthTyping", !current, false);

        const status = !current ? "enabled" : "disabled";
        if (ephemeral) {
            messageUtil.sendBotMessage(ctx.channel.id, `Silent Typing is now **${status}**.`);
        } else {
            messageUtil.sendMessage(ctx.channel.id, { content: `Silent Typing is now **${status}**.` });
        }
    },
};