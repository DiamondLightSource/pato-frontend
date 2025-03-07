import { Params, replace } from "react-router-dom";
import { components } from "schema/main";
import { client } from "utils/api/client";

export const groupLoader = async (params: Params<string>) => {
  const resp = await client.safeGet(`dataGroups/${params.groupId}`);
  const sessionLocation = `/proposals/${params.propId}/sessions/${params.visitId}`;

  if (resp.status !== 200) {
    return replace(sessionLocation);
  }

  const dataCollectionGroup =
    resp.data as components["schemas"]["DataCollectionGroupSummaryResponse"];

  switch (dataCollectionGroup.experimentTypeName) {
    case "Single Particle":
      return replace("./spa");
    case "Tomography":
      return replace("./tomograms");
    default:
      return replace(sessionLocation);
  }
};
