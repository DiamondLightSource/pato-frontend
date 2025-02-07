import { atlasLoader } from "loaders/atlas";
import { queryClient } from "utils/test-utils";

const request = new Request("http://localhost/dataGroups/1/atlas");

describe("Atlas Data", () => {
  it("should get atlas data", async () => {
    const data = await atlasLoader(queryClient)(request, { groupId: "1" });

    expect(data.gridSquares).toHaveLength(1);
    expect(data.atlas).toEqual({ atlasId: 1 });
  });
});
