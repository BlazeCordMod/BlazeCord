import type { OptionDefinition, BlazeCordPluginInstance } from "@plugins/types";

export interface BaseOptionRowProps<T extends string = string> {
    opt: OptionDefinition & { type: T };
    plugin: BlazeCordPluginInstance;
    settingKey: string;

    start: boolean;
    end: boolean;
}
