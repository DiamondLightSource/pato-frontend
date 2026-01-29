import { ClemROIs } from "components/clem/ROI";
import { components } from "schema/main";
import { render, screen } from "@testing-library/react";

const gridSquare: components["schemas"]["GridSquare"] = {
  gridSquareId: 1,
  x: 0,
  y: 1,
  height: 0,
  width: 0,
  angle: 0,
  hasBlue: true,
  hasRed: false,
  hasCyan: false,
  hasGreen: false,
  hasMagenta: false,
  hasYellow: false,
  hasGrey: false,
};

describe("CLEM ROIs", () => {
  it("should display ROI viewer and all available colours by default", async () => {
    render(<ClemROIs gridSquare={gridSquare} />);

    const blue = await screen.findByText("http://localhost/grid-squares/1/image?colour=blue");

    expect(blue).toHaveAttribute("aria-hidden", "false");
  });

  it("should display message if no grid square is available", () => {
    render(<ClemROIs gridSquare={null} />);

    expect(
      screen.getByText(
        "No grid square selected. Select one by clicking one of the atlas grid squares."
      )
    ).toBeInTheDocument();
  });
});
