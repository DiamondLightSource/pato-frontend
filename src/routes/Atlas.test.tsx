import { screen } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import AtlasPage from "./Atlas";

describe("Atlas", () => {
  it("should render page", async () => {
    renderWithRoute(<AtlasPage />, () => ({ gridSquares: [] }));

    await screen.findByText("Atlas");
  });
});
