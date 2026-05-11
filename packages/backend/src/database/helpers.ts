import type { SDK } from "caido:plugin";

export async function getProjectId(sdk: SDK): Promise<string> {
  const project = await sdk.projects.getCurrent();
  const projectId = project?.getId().toString();
  if (projectId === undefined) {
    throw new Error("Project not found");
  }
  return projectId;
}
