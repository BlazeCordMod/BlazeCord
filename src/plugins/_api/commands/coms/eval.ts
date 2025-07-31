import { t } from "@i18n";
import { type ApplicationCommand, ApplicationCommandOptionType } from "../types";
import { messageUtil } from "@metro/common/libraries";
import { lookupByProps } from "@metro/common/wrappers";

const util = lookupByProps("inspect").asLazy();
const AsyncFunction = (async () => void 0).constructor;
const ZERO_WIDTH_SPACE_CHARACTER = "\u200B";

function wrapInJSCodeblock(resString: string) {
    return "```js\n" + resString.replaceAll("`", "`" + ZERO_WIDTH_SPACE_CHARACTER) + "\n```";
}

export default () => <ApplicationCommand>{
    name: "eval",
    description: "Run javascript code snippits.",
    options: [
        {
            name: "code",
            type: ApplicationCommandOptionType.STRING,
            description: "Code to execute.",
            required: true,
        },
        {
            name: "async",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: "async",
        },
    ],
    async execute([code, asyncFlag], ctx) {
        try {
            const res = util.inspect(
                asyncFlag?.value ? await AsyncFunction(code.value)() : eval?.(code.value)
            );
            const trimmedRes = res.length > 2000 ? res.slice(0, 2000) + "..." : res;
            messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(trimmedRes));
        } catch (err: any) {
            messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(err?.stack ?? err));
        }
    },
};