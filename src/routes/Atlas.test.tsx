import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithRoute } from "utils/test-utils";
import AtlasPage from "./Atlas";

describe("Atlas", () => {
  it("should render page", async () => {
    renderWithRoute(<AtlasPage />, () => ({ gridSquares: [] }));

    await screen.findByText("Atlas");
  });

  it("should display message if grid square is null or invalid", async () => {
    renderWithRoute(<AtlasPage />, () => ({ gridSquares: [] }), ["?gridSquare=InvalidNumber"]);

    await screen.findByText(/no grid square selected/i);
  });

  it("should update search params if grid square is clicked", async () => {
    const { router } = renderWithRoute(
      <AtlasPage />,
      () => ({
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
    renderWithRoute(<AtlasPage />, () => ({ gridSquares: [] }));

    expect(await screen.findByRole("checkbox")).not.toBeChecked();
  });

  it("should should update search params when checked", async () => {
    const { router } = renderWithRoute(<AtlasPage />, () => ({ gridSquares: [] }), [
      "?hideUncollected=true",
    ]);

    const checkbox = await screen.findByRole("checkbox");

    fireEvent.click(checkbox);
    await waitFor(() => expect(router.state.location.search).toBe("?hideUncollected=true"));
    fireEvent.click(checkbox);
    await waitFor(() => expect(router.state.location.search).toBe("?hideUncollected=false"));
  });
});
