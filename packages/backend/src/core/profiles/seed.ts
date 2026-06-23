import type { SDK } from "caido:plugin";

import { getChecks, getScanProfiles, insertScanProfile } from "../../database";

const BLIND_XSS_PROFILE_NAME = "Blind XSS";

export async function seedProfiles(sdk: SDK): Promise<void> {
  const profiles = await getScanProfiles(sdk);
  if (profiles.some((profile) => profile.name === BLIND_XSS_PROFILE_NAME)) {
    return;
  }

  const checks = await getChecks(sdk);
  const blindXssCheck = checks.find(
    (check) => check.name === BLIND_XSS_PROFILE_NAME,
  );
  if (blindXssCheck === undefined) {
    throw new Error("Cannot seed Blind XSS profile: check not found");
  }

  await insertScanProfile(sdk, {
    name: BLIND_XSS_PROFILE_NAME,
    checkIds: [blindXssCheck.id],
    threads: 1,
    delayMs: 2000,
    timeoutSec: 30,
  });
  sdk.console.log(`Seeded scan profile: ${BLIND_XSS_PROFILE_NAME}`);
}
