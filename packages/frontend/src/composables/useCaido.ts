import { getRequestIds } from "@caido-utils/frontend-sdk";

import { useDialog } from "@/composables/useDialog";
import { useScan } from "@/composables/useScan";
import type { FrontendSDK, ScanProfile } from "@/types";

export function useCaido(sdk: FrontendSDK) {
  const { openSendToAutoReplay } = useDialog();
  const { launchProfileScan } = useScan(sdk);

  const registerNavigation = (root: HTMLElement) => {
    sdk.navigation.addPage("/autoreplay", {
      body: root,
    });

    sdk.sidebar.registerItem("AutoReplay", "/autoreplay", {
      icon: "fas fa-bolt",
    });
  };

  const getProfileRegistrations = async (): Promise<ScanProfile[]> => {
    const result = await sdk.backend.getScanProfiles();
    if (result.kind === "Error") {
      sdk.window.showToast(result.error, { variant: "error" });
      return [];
    }

    return result.value;
  };

  const registerCommands = (profiles: ScanProfile[]) => {
    sdk.commands.register("autoreplay:open", {
      name: "Open AutoReplay",
      run: () => {
        sdk.navigation.goTo("/autoreplay");
      },
    });

    sdk.commands.register("autoreplay:send", {
      name: "Send to AutoReplay",
      run: (context) => {
        try {
          const requestIds = getRequestIds(context);

          openSendToAutoReplay(requestIds);
        } catch (err) {
          sdk.window.showToast(
            err instanceof Error
              ? err.message
              : "Failed to send requests to AutoReplay",
            {
              variant: "error",
            },
          );
        }
      },
    });

    for (const profile of profiles) {
      const commandId = `autoreplay:profile-${profile.id}`;
      sdk.commands.register(commandId, {
        name: `Run AutoReplay: ${profile.name}`,
        group: "AutoReplay Profiles",
        run: async (context) => {
          try {
            const requestIds = getRequestIds(context);
            await launchProfileScan(profile.id, requestIds);
          } catch (err) {
            sdk.window.showToast(
              err instanceof Error
                ? err.message
                : "Failed to launch AutoReplay profile",
              { variant: "error" },
            );
          }
        },
      });
    }
  };

  const registerMenuItems = (profiles: ScanProfile[]) => {
    sdk.menu.registerItem({
      type: "Request",
      commandId: "autoreplay:send",
      leadingIcon: "fas fa-bolt",
    });

    sdk.menu.registerItem({
      type: "RequestRow",
      commandId: "autoreplay:send",
      leadingIcon: "fas fa-bolt",
    });

    for (const profile of profiles) {
      const commandId = `autoreplay:profile-${profile.id}`;
      sdk.menu.registerItem({
        type: "Request",
        commandId,
        leadingIcon: "fas fa-bolt",
      });
      sdk.menu.registerItem({
        type: "RequestRow",
        commandId,
        leadingIcon: "fas fa-bolt",
      });
    }
  };

  const register = async (root: HTMLElement) => {
    registerNavigation(root);
    const profiles = await getProfileRegistrations();
    registerCommands(profiles);
    registerMenuItems(profiles);
  };

  return {
    register,
  };
}
