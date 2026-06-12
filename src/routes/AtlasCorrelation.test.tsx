import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import AtlasCorrelationPage from "./AtlasCorrelation";
import { SearchMap } from "components/atlas/SearchMap";

const baseLoaderDict = {
  items: [
    {
      dataCollectionGroupId: 12345,
      collections: 1,
      experimentTypeName: "SPA",
      atlasId: 12345,
    },
  ],
  total: 1,
  limit: 25,
};

const baseLoader = () => baseLoaderDict;

describe("Atlas Correlation", () => {
  it("should display list of atlases", async () => {
    renderWithRoute(<AtlasCorrelationPage />, baseLoader);

    await screen.findByText("12345");
  });

  it("should display submit button if atlas is selected", async () => {
    renderWithRoute(<AtlasCorrelationPage />, baseLoader, ["/foo?correlatedId=1234"]);

    await screen.findByText("Submit");
  });
});
