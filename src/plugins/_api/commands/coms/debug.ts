import { t } from "@i18n";
import { type ApplicationCommand, ApplicationCommandOptionType } from "../types";
import { getDebugInfo } from "@debug/info";
import { messageUtil } from "@metro/common/libraries";

export default () => <ApplicationCommand>{
    name: "debug",
    description: "Get your current runtime info.",
    options: [
        {
            name: "ephemeral",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: "Send Ephemeral?",
        }
    ],
    execute([ephemeral], ctx) {
        const info = getDebugInfo();
        const content = [
            "**BlazeCord Debug Info**",
            `> BlazeCord: ${info.blaze.version} (${info.blaze.shortRevision} ${info.blaze.remote})`,
            `> Discord: ${info.discord.version} (${info.discord.build})`,
            `> React: ${info.react.version} (Native ${info.reactNative.version})`,
            `> Hermes: ${info.hermes.buildType} (bcv${info.hermes.bytecodeVersion})`,
            `> System: ${info.os.name} ${info.os.version})`,
            `> Device: ${info.device.manufacturer} (${info.device.model} ${info.device.brand})`,
        ].join("\n");

        if (ephemeral?.value) {
            messageUtil.sendBotMessage(ctx.channel.id, content);
        } else {
            messageUtil.sendMessage(ctx.channel.id, { content });
        }
    }
};
