import { lookupByProps } from "@metro/common/wrappers";

// Command Shit
export let commands = lookupByProps("getBuiltInCommands").asLazy(m => (commands = m));
export let messageUtil = lookupByProps("sendBotMessage").asLazy(m => (messageUtil = m));