import type { BlazeApplicationCommand, Argument, CommandContext, CommandResult } from "../types";

const pingCommand: BlazeApplicationCommand = {
    name: "ping",
    description: "Replies with Pong!",
    options: [],
    shouldHide: () => false,
    execute(args: Argument[], ctx: CommandContext): CommandResult {
        return { content: "Pong!" };
    },
};

export default pingCommand;