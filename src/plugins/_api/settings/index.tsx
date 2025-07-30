import { definePlugin, definePluginSettings, logger } from "#plugin-context";
import {
    _registeredSettingItems,
    _registeredSettingSections,
    registerSettingRenderer,
    registerSettingSection,
    type SettingRendererConfig,
} from "@api/settings";
import { TableRow } from "@components/Discord";
import Tag from "@components/Blaze/Tag";
import { Devs } from "@data/constants";
import { getVersions } from "@debug/info";
import { t } from "@i18n";
import { byName, byProps } from "@metro/common/filters";
import { PaintPaletteIcon, PuzzlePieceIcon, WrenchIcon } from "@metro/common/icons";
import { NavigationNative } from "@metro/common/libraries";
import { useUpdaterStore } from "@stores/useUpdaterStore";
import { findInReactTree } from "@utils/objects";
import { memoize } from "es-toolkit";
import { memo, useLayoutEffect } from "react";

const settings = definePluginSettings({
    onTop: {
        label: "Put on top",
        description: "Put the settings on top of the settings list",
        type: "boolean",
        default: false,
    },
});

export default definePlugin({
    name: "Settings",
    description: "Provides a settings interface and debug information",
    authors: [Devs.Pylix],
    required: true,

    patches: [
        {
            id: "add-renderer",
            target: byProps(["SETTING_RENDERER_CONFIG"]),
            patch(module, patcher) {
                const origRendererConfig = module.SETTING_RENDERER_CONFIG as SettingRendererConfig;

                Object.defineProperty(module, "SETTING_RENDERER_CONFIG", {
                    enumerable: true,
                    configurable: true,
                    get: () => ({
                        ...origRendererConfig,
                        ..._registeredSettingItems,
                    }),
                    set: value => {
                        Object.defineProperty(module, "SETTING_RENDERER_CONFIG", {
                            writable: true,
                            value,
                        });
                    },
                });

                patcher.attachDisposer(() => {
                    module.SETTING_RENDERER_CONFIG = origRendererConfig;
                });
            },
        },
        {
            id: "overview-screen",
            target: byName("SettingsOverviewScreen", { returnEsmDefault: false }),
            patch(module, patcher) {
                patcher.after(module, "default", (_, ret) => {
                    const { props } = findInReactTree(ret, i => i.props?.sections);
                    if (!props) {
                        logger.warn("Failed to find settings sections in SettingsOverviewScreen");
                        return;
                    }

                    if (!settings.get().onTop) {
                        try {
                            const accountSectionIndex = props.sections.findIndex((i: any) =>
                                i.settings.includes("ACCOUNT"),
                            );
                            if (accountSectionIndex !== -1) {
                                props.sections = [
                                    ...props.sections.slice(0, accountSectionIndex + 1),
                                    ..._registeredSettingSections,
                                    ...props.sections.slice(accountSectionIndex + 1),
                                ];
                                return;
                            }
                        } catch (e) {
                            logger.warn`Failed to insert settings sections next to account section: ${e}`;
                        }
                    }

                    props.sections = [..._registeredSettingSections, ...props.sections];
                });
            },
        },
    ],

    start() {
        setImmediate(() => {
            // Hack that allows pushing custom pages without having to register the setting renderer
            // by passing the component through the route params
            registerSettingRenderer("BLAZECORD_CUSTOM_PAGE", {
                type: "route",
                title: () => "",
                unsearchable: true,
                screen: {
                    route: "BLAZECORD_CUSTOM_PAGE",
                    getComponent: memoize(() =>
                        memo(() => {
                            const navigation = NavigationNative.useNavigation();
                            const route = NavigationNative.useRoute();

                            const { render: PageComponent, ...args } = route.params;

                            // biome-ignore lint/correctness/useExhaustiveDependencies: This is fine
                            useLayoutEffect(() => void navigation.setOptions({ ...args }), [navigation]);

                            // TODO: Wrap with ErrorBoundary
                            return <PageComponent />;
                        }),
                    ),
                },
            });

            registerSettingSection({
                label: t.blazecord(),
                settings: [
                    registerSettingRenderer("BLAZECORD", {
                        type: "route",
                        title: () => t.blazecord(),
                        IconComponent: () => <TableRow.Icon source={require("@assets/ic_blazecord.png")} />,
                        useTrailing: () => {
                            const availableUpdate = useUpdaterStore(s => s.availableUpdate);
                            if (availableUpdate) return <Tag text={t.updater.update_tag()} />;

                            const { version, shortRevision, branch } = getVersions().bunny;
                            return `${version}-${shortRevision} (${branch})`;
                        },
                        screen: {
                            route: "BLAZECORD",
                            getComponent: () => require("@components/Blaze/Settings/pages/General").default,
                        },
                    }),
                    registerSettingRenderer("BLAZECORD_PLUGINS", {
                        type: "route",
                        title: () => t.settings.sections.plugins(),
                        IconComponent: PuzzlePieceIcon,
                        screen: {
                            route: "BLAZECORD_PLUGINS",
                            getComponent: () => require("@components/Blaze/Settings/pages/Plugins").default,
                        },
                    }),
                    registerSettingRenderer("BLAZECORD_THEMES", {
                        type: "route",
                        title: () => t.settings.sections.themes(),
                        IconComponent: PaintPaletteIcon,
                        screen: {
                            route: "BLAZECORD_THEMES",
                            getComponent: () => require("@components/Blaze/Settings/pages/Themes").default,
                        },
                    }),
                    registerSettingRenderer("BLAZECORD_DEVELOPER", {
                        type: "route",
                        title: () => t.settings.sections.developer(),
                        IconComponent: WrenchIcon,
                        screen: {
                            route: "BLAZECORD_DEVELOPER",
                            getComponent: () => require("@components/Blaze/Settings/pages/Developer").default,
                        },
                    }),
                    // registerSettingRenderer("BLAZECORD_UPDATER", {
                    //     type: "route",
                    //     title: () => t.settings.sections.updater(),
                    //     IconComponent: DownloadIcon,
                    //     screen: {
                    //         route: "BLAZECORD_UPDATER",
                    //         getComponent: () => lazy(() => import("@components/BlazeSettings/pages/Updater")),
                    //     },
                    // }),
                ],
            });
        });
    },
});
