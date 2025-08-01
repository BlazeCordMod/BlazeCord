import { type ApplicationCommand } from "../types";
import { messageUtil } from "@metro/common/libraries";

export default () => <ApplicationCommand>{
    name: "ping",
    displayName: "ping",
    description: "Pong!",
    options: [],
    execute(_, ctx) {
        messageUtil.sendMessage(ctx.channel.id, {
            content: "Pong! 🏓"
        });
    }
};