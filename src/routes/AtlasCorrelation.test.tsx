import { screen } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import AtlasCorrelationPage from "./AtlasCorrelation";

const baseLoaderDict = {
  items: [
    {
      dataCollectionGroupId: 12345,
      collections: 1,
      experimentTypeName: "SPA",
      atlasId: 12345,
      atlasPath: "/dls/foo.jpg",
    },
  ],
  total: 1,
  limit: 25,
};

const baseLoader = () => baseLoaderDict;

describe("Atlas Correlation", () => {
  it("should display list of atlases", async () => {
    renderWithRoute(<AtlasCorrelationPage />, baseLoader);

    await screen.findByText("/dls/foo.jpg");
  });

  it("should display submit button if atlas is selected", async () => {
    renderWithRoute(<AtlasCorrelationPage />, baseLoader, ["/foo?correlatedId=1234"]);

    await screen.findByText("Submit");
  });
});
