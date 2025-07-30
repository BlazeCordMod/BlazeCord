import { lazyDestructure } from "@utils/lazy";
import { lookupByProps } from "../wrappers";

// Discord
export let constants = lookupByProps("Fonts", "Permissions").asLazy(m => (constants = m));
export let i18n = lookupByProps("Messages").asLazy(m => (i18n = m));

// Colors & Shit
export let tokens = lookupByProps("unsafe_rawColors", "colors").asLazy(m => (tokens = m));
export let { useToken } = lazyDestructure(() => lookupByProps("useToken").asLazy(m => ({ useToken } = m))) as any;

// Channels & Shit
export let channels = lookupByProps("getVoiceChannelId").asLazy(m => (channels = m));
export let invites = lookupByProps("acceptInviteAndTransitionToInviteChannel").asLazy(m => (invites = m));
