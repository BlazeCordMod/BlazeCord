import { patcher } from "#plugin-context";
import { blzlogger } from "@api/logger";
import { commands as commandsModule, messageUtil } from "@metro/common/libraries";
import type { ApplicationCommand, BlazeApplicationCommand, Argument, CommandContext, CommandResult } from "./types";
import { ApplicationCommandInputType, ApplicationCommandType } from "./types"
export let commands: BlazeApplicationCommand[] = [];

export function patchAppCommands() {
    const unpatch = patcher.after(
        commandsModule,
        "getBuiltInCommands",
        (args, res) => {
            const type = args[0] as ApplicationCommandType | ApplicationCommandType[];

            return [
                ...res,
                ...commands.filter(
                    (c) =>
                        (Array.isArray(type) ? type.includes(c.type!) : type === c.type) &&
                        c.__blaze?.shouldHide?.() !== false
                ),
            ];
        }
    );

    [
        require("./coms/debug").default,
        require("./coms/eval").default,
        require("./coms/ping").default,
    ].forEach((cmdFactory) => registerCommand(cmdFactory()));

    return () => {
        commands = [];
        unpatch();
    };
}

export function registerCommand(command: BlazeApplicationCommand): () => void {
    let builtInCommands: ApplicationCommand[];

    try {
        builtInCommands = commandsModule.getBuiltInCommands(ApplicationCommandType.CHAT, true, false);
    } catch {
        builtInCommands = commandsModule.getBuiltInCommands(Object.values(ApplicationCommandType), true, false);
    }

    builtInCommands.sort((a, b) => parseInt(b.id!) - parseInt(a.id!));

    const lastCommand = builtInCommands[builtInCommands.length - 1];
    command.id = (parseInt(lastCommand.id!, 10) - 1).toString();

    command.__blaze = { shouldHide: command.shouldHide };
    command.applicationId ??= "-1";
    command.type ??= ApplicationCommandType.CHAT;
    command.inputType = ApplicationCommandInputType.BUILT_IN;
    command.displayName ??= command.name;
    command.untranslatedName ??= command.name;
    command.displayDescription ??= command.description;
    command.untranslatedDescription ??= command.description;

    if (command.options)
        for (const opt of command.options) {
            opt.displayName ??= opt.name;
            opt.displayDescription ??= opt.description;
        }

    // Wrap the execute function to handle promise & send message result
    const originalExecute = command.execute;
    command.execute = function (
        args: Argument[],
        ctx: CommandContext
    ): void | Promise<void> {
        try {
            const result = originalExecute.call(command, args, ctx);
            if (result instanceof Promise) {
                result
                    .then((ret) => {
                        if (ret && typeof ret === "object") {
                            messageUtil.sendMessage(ctx.channel.id, ret);
                        }
                    })
                    .catch((err) => {
                        blzlogger.error(`Command execution failed (sync): ${err}`);
                    });
            } else if (result && typeof result === "object") {
                messageUtil.sendMessage(ctx.channel.id, result);
            }
        } catch (err) {
            blzlogger.error(`Command execution failed (sync): ${err}`);
        }
    };

    commands.push(command);

    // Return unregister function
    return () => {
        commands = commands.filter((c) => c.id !== command.id);
    };
}