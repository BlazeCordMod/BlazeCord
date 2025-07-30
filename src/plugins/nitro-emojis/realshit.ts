import { getStore } from "@metro/common/stores";

const emojiRegex = /https:\/\/cdn.discordapp.com\/emojis\/(\d+)\.\w+/;

export function patchRealmoji(module: any, patcher: any, getSetting: () => boolean) {
    const { getCustomEmojiById } = getStore("EmojiStore");

    patcher.before(module.prototype, "generate", ([data]: any[]) => {
        if (!getSetting()) return;
        if (data.rowType !== 1) return;

        let content = data.message.content;
        if (typeof content !== "string" || !content.length) return;

        const matchIndex = content.match(emojiRegex)?.index;
        if (matchIndex === undefined) return;

        const emojis = content.slice(matchIndex).trim().split("\n");
        if (!emojis.every((s) => emojiRegex.test(s))) return;

        content = content.slice(0, matchIndex);

        while (content.includes("  ")) {
            content = content.replace("  ", ` ${emojis.shift()} `);
        }

        content = content.trim();
        if (emojis.length > 0) content += ` ${emojis.join(" ")}`;

        const embeds = data.message.embeds;
        for (let i = 0; i < embeds.length; i++) {
            const embed = embeds[i];
            if (embed.type === "image" && emojiRegex.test(embed.url)) {
                embeds.splice(i--, 1);
            }
        }

        data.message.content = content;
        data.__realshit = true;
    });

    patcher.after(module.prototype, "generate", ([data]: any[], row: any) => {
        if (!getSetting()) return;
        if (data.rowType !== 1 || data.__realshit !== true) return;

        const content = row.message?.content;
        if (!Array.isArray(content)) return;

        const jumbo = content.every(
            (c) =>
                (c.type === "link" && emojiRegex.test(c.target)) ||
                (c.type === "text" && c.content === " ")
        );

        for (let i = 0; i < content.length; i++) {
            const el = content[i];
            if (el.type !== "link") continue;

            const match = el.target.match(emojiRegex);
            if (!match) continue;

            const id = match[1];
            const url = `${match[0]}?size=128`;
            const emoji = getCustomEmojiById(id);

            content[i] = {
                type: "customEmoji",
                id,
                alt: emoji?.name ?? "<BlazeWuzHere>",
                src: url,
                frozenSrc: url.replace("gif", "webp"),
                jumboable: jumbo ? true : undefined,
            };
        }
    });
}