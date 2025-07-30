import type { BaseTranslation } from "../i18n-types.js";

const en = {
    discord: "Discord",
    blazecord: "BlazeCord",
    ui: {
        components: {
            search: {
                placeholder: "Search",
            },
        },
    },
    error_boundary: {
        uh_oh: "Fuckn Blaze~",
        retry_render: "Retry",
        reload: "Reload BlazeCord",
        safe_mode: "Safe-Mode",
        stack_trace: "Stack-Trace",
        screen: {
            copy: "Copy",
            show_more: "Show more",
            show_less: "Show less",
            component_stack: "Component Stack",
            call_stack: "Call Stack",
            description: "Something fucked up rendering some shit. Could've been caused by Discord internally, or because Blaze is a fucking skidtard.",
        }
    },
    actions: {
        nevermind: "Nevermind",
        dismiss: "Dismiss",
        copy: "Copy",
    },
    updater: {
        update_tag: "Update",
        update_available: "Update Available",
        new_version: "A new version of BlazeCord is available!",
        update_now: "Update Now",
        update_and_restart: "Update and Restart",
        already_latest: "You're already on the latest version!",
        failed_to_check: "Failed to check for updates",
        error_alert: "An error occurred while checking for updates.",
    },
    settings: {
        sections: {
            plugins: "Plugins",
            themes: "Themes",
            wallpapers: "Wallpapers",
            developer: "Developer",
            updater: "Updater",
        },
        general: {
            info: "Info",
            logs: "Logs",
            platform: "Platform",
            quick_actions: "Quick Actions",
            reload: "Reload BlazeCord",
            links: "Links",
            github: "GitHub",
            discord: "Discord",
            paypal: "PayPal",
            react: "React",
            react_native: "React Native",
            hermes: "Hermes",
            client_info: {
                label: "Client Info",
            },
            configurations: {
                label: "Configurations",
                safe_mode: {
                    label: "Safe Mode",
                    description: "Stops all plugins not required to run. Useful when something breaks, because it will eventually lol. *Restart required*",
                    alert: {
                        title: "{action|{disable: Disable, enable: Enable}} Safe Mode?",
                        description: "Do you want to {action:string} safe mode? This will {action|{enable: stop all non-essential plugins from running, disable: allow all plugins to run normally}}. Restart the app to take effect.",
                        apply_and_restart: "Apply & Restart",
                        apply_without_restart: "Apply & Continue",
                    },
                }
            }
        },
        plugins: {
            description: "Description",
            safe_mode_callout: "Safe Mode Enabled",
            safe_mode_callout_desc: "Only essential plugins will be loaded.",
            info_sheet: {
                details: "Details",
                more_info: "More Info",
                view_source: "View Source",
                configurations: "Configurations",
                authors: "Authors",
                version: "Version",
                id: "ID",
                path: "Path",
            }
        },
        developer: {
            sections: {
                init_config: {
                    label: "Loader Configurations",
                    sublabel: "Override where BlazeCord's bundle.js is loaded from. (Advanced)",
                    custom_endpoint: "Custom Endpoint:",
                    bundle_path: "Custom Path:",
                    bundle_path_desc: "Override the path to BlazeCord's bundle.js file.",
                    force_update: "Force Update",
                    force_update_desc: "Forcefully fetch BlazeCords latest bundle.js every app start to always load the latest build.",
                },
                tools: {
                    label: "Tools",
                    asset_browser: {
                        label: "Asset Browser",
                    }
                },
                playground: {
                    label: "Playground",
                },
                actions: {
                    label: "Actions",
                    invalidate_metro_cache: "Wipe Metro Cache",
                }
            },
        },
        updater: {
            info: "Info",
            repo: "Repo",
            settings: "Settings",
            autoUpdate: "Auto-Update",
            autoUpdateDescription: "Automatically update BlazeCord without prompts when a new version becomes available.",
            notifyNewUpdates: "Prompt-Update",
            notifyNewUpdatesDescription: "Show a notification when a new version of BlazeCord is available.",
            checkForUpdates: "Check for Updates",
        },
    },
    commands: {
        debug: {
            info: "Send debug information",
            ephemeral: "Send ephemerally",
        }
    },
} satisfies BaseTranslation;

export default en;
