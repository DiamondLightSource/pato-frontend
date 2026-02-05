import { ColourChannelDisplay } from "components/clem/ColourChannelDisplay";
import { render, screen } from "@testing-library/react";
import { colours } from "utils/test-utils";

describe("Colour Channel Display", () => {
  it("should display plain image if data type is atlas", () => {
    render(<ColourChannelDisplay colours={colours} itemId={1} dataType='atlas' />);

    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("should display APNG viewer if data type is atlas", () => {
    render(<ColourChannelDisplay colours={colours} itemId={1} dataType='gridSquare' />);

    expect(
      screen.getByText("http://localhost/grid-squares/1/image?colour=cyan")
    ).toBeInTheDocument();
  });

  it("should display message if no colour channels are selected", () => {
    render(<ColourChannelDisplay colours={{ ...colours, yellow: null }} itemId={1} />);

    expect(screen.getByText("No colour channel selected")).toBeInTheDocument();
  });
});
