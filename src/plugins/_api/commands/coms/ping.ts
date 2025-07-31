import { type ApplicationCommand } from "../types";
import type { Argument, CommandContext, CommandResult } from "../types";

export default () => <ApplicationCommand>{
    name: "ping",
    description: "Pong!",
    options: [],
    shouldHide: () => false,
    execute(args: Argument[], ctx: CommandContext): CommandResult {
        return { content: "Ping these nuts, motherfucker~" };
    },
};