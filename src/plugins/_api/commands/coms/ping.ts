import type { Argument, CommandContext, CommandResult } from "../types";

export default () => ({
    name: "ping",
    description: "Replies with Pong!",
    options: [],
    shouldHide: () => false,
    execute(args: Argument[], ctx: CommandContext): CommandResult {
        return { content: "Pong!" };
    },
});