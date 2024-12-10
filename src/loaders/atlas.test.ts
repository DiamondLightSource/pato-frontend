import { atlasLoader } from "loaders/atlas";
import { queryClient } from "utils/test-utils";

describe("Atlas Data", () => {
  it("should get atlas data", async () => {
    const data = await atlasLoader(queryClient)({ groupId: "1" });

    expect(data.gridSquares).toHaveLength(1);
    expect(data.atlas).toEqual({ atlasId: 1 });
  });
});
