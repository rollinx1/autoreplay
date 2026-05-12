import type { SDK } from "caido:plugin";

import { getChecks as getChecksDb, insertCheck } from "../../database";

import { bxssCheck } from "./presets";

const PRESETS = [bxssCheck];

export async function seedChecks(sdk: SDK): Promise<void> {
  const existing = await getChecksDb(sdk);
  const existingNames = new Set(existing.map((c) => c.name));

  for (const preset of PRESETS) {
    if (!existingNames.has(preset.name)) {
      await insertCheck(sdk, {
        name: preset.name,
        description: preset.description,
        code: preset.code,
      });
      sdk.console.log(`Seeded preset check: ${preset.name}`);
    }
  }
}
