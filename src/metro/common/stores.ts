import { createModuleFilter, withInteropOptions } from "@metro/filters";
import { lookup } from "../api";
import type * as S from "discord-types/stores";

export const byStoreName = createModuleFilter(
    withInteropOptions<string>({
        filter: ([name, m]) => m.constructor?.displayName === name && m.getName() === name,
        stringify: arg => `byStoreName(${arg})`,
    }),
);

export function getStore(name: string, resolver?: (store: any) => any): S.FluxStore & Record<string, any> {
    return lookup(byStoreName(name, { checkEsmDefault: true })).asLazy(resolver) as S.FluxStore;
}

export let UserStore = getStore("UserStore", m => (UserStore = m)) as S.UserStore;

export let ChannelStore = getStore("ChannelStore", m => (ChannelStore = m)) as S.ChannelStore;
export let SelectedChannelStore = getStore("SelectedChannelStore", m => (SelectedChannelStore = m)) as S.SelectedChannelStore;

export let GuildStore = getStore("GuildStore", m => (GuildStore = m)) as S.GuildStore;
export let GuildMemberStore = getStore("GuildMemberStore", m => (GuildMemberStore = m)) as S.GuildMemberStore;
export let SelectedGuildStore = getStore("SelectedGuildStore", m => (SelectedGuildStore = m)) as S.SelectedGuildStore;

export let RelationshipStore = getStore("RelationshipStore", m => (RelationshipStore = m)) as S.RelationshipStore;

export let MessageStore = getStore("MessageStore", m => (MessageStore = m)) as S.MessageStore;

export let DeveloperExperimentStore = getStore("DeveloperExperimentStore", m => (DeveloperExperimentStore = m));

export let ToastStore = getStore("ToastStore", m => (ToastStore = m));

export let PermissionStore = getStore("PermissionStore", m => (PermissionStore = m));

export let EmojiStore = getStore("EmojiStore", m => (EmojiStore = m));

export let ThemeStore = getStore("ThemeStore", m => (ThemeStore = m));
