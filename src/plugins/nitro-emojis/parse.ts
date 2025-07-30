import { getStore } from "@metro/common/stores";

const GuildStore = getStore("GuildStore");

export function modifyIfNeeded(
    msg: any,
    haveNitro: boolean,
    settings: {
        get(): {
            emojiSize: number;
            hyperlink: boolean;
            forceMoji: boolean;
        };
    }
) {
    if (!msg?.content?.match(/<a?:(\w+):(\d+)>/)) return;

    const { emojiSize, forceMoji, hyperlink } = settings.get();
    if (!forceMoji && haveNitro) return;

    const currentGuildId = GuildStore.getLastSelectedGuildId?.();

    msg.content = msg.content.replace(
        /<(a?):(\w+):(\d+)>/gi,
        (match: string, animatedFlag: string, name: string, id: string) => {
            if (currentGuildId && match.includes(currentGuildId)) return match;
            const ext = animatedFlag === "a" ? "gif" : "webp";
            const url = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=${emojiSize}&quality=lossless`;
            return hyperlink ? `[${name}](${url})` : url;
        }
    );

    msg.invalidEmojis = [];
}