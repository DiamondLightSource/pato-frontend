import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import AtlasPage from "./Atlas";

const baseLoaderDict = { atlas: {pixelSize: 5}, gridSquares: [], dataCollectionGroup: {experimentTypeName: "SPA"} };
const baseLoader = () => baseLoaderDict;

describe("Atlas", () => {
  it("should render page", async () => {
    renderWithRoute(<AtlasPage />, baseLoader);

    await screen.findByText("Atlas");
  });

  it("should display message if grid square is null or invalid", async () => {
    renderWithRoute(<AtlasPage />, baseLoader, ["?gridSquare=InvalidNumber"]);

    await screen.findByText(/no grid square selected/i);
  });

  it("should update search params if grid square is clicked", async () => {
    const { router } = renderWithRoute(
      <AtlasPage />,
      () => ({
        ...baseLoaderDict,
        gridSquares: [
          { x: 1, y: 1, height: 1, width: 1, angle: 90, gridSquareId: 1, image: "test/image.jpg" },
        ],
      }),
      ["?gridSquare=InvalidNumber"]
    );

    fireEvent.click(await screen.findByRole("button"));
    await waitFor(() => expect(router.state.location.search).toBe("?gridSquare=1"));
  });

  it("should be unchecked by default", async () => {
    renderWithRoute(<AtlasPage />, baseLoader);

    expect(await screen.findByLabelText("Hide uncollected grid squares")).not.toBeChecked();
  });

  it("should should update search params when checked", async () => {
    const { router } = renderWithRoute(<AtlasPage />, baseLoader, [
      "?hideSquares=true",
    ]);

    const checkbox = await screen.findByLabelText("Hide uncollected grid squares");

    fireEvent.click(checkbox);
    await waitFor(() => expect(router.state.location.search).toBe("?hideSquares=true"));
    fireEvent.click(checkbox);
    await waitFor(() => expect(router.state.location.search).toBe("?hideSquares=false"));
  });

  it("should display search map if experiment type is tomography", async () => {
    renderWithRoute(<AtlasPage />, () => ({...baseLoaderDict, dataCollectionGroup: {experimentTypeName: "Tomogram"}}));

    await screen.findByText("Search Map");
  });
});
