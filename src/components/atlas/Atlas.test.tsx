import { renderWithRoute } from "utils/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { Atlas } from "components/atlas/Atlas";

const atlasItems = {
  gridSquares: [{ x: 1, y: 1, width: 1, height: 1, gridSquareId: 1, angle: 1 }],
};

describe("Atlas", () => {
  it("should fire event if grid square clicked", async () => {
    const onGridSquareClicked = vi.fn();

    renderWithRoute(
      <Atlas groupId='1' onGridSquareClicked={onGridSquareClicked} />,
      () => atlasItems
    );

    fireEvent.click(await screen.findByRole("button"));

    expect(onGridSquareClicked).toBeCalledWith(atlasItems.gridSquares[0]);
  });

  it("should make selected grid square blue", async () => {
    renderWithRoute(<Atlas groupId='1' selectedGridSquare={1} />, () => atlasItems);

    const gridSquare = await screen.findByRole("button");

    expect(gridSquare).toHaveAttribute("fill", "blue");
  });

  it("should display message if no atlas grid information is available", async () => {
    renderWithRoute(<Atlas groupId='1' selectedGridSquare={1} />, () => ({ gridSquares: [] }));

    await screen.findByText("No atlas grid information available");
  });

  it("should display message if no valid data is returned", async () => {
    renderWithRoute(<Atlas groupId='1' />, () => null);

    await screen.findByText("No atlas grid information available");
  });
});
