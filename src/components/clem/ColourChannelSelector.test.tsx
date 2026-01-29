import { ColourChannelSelector } from "components/clem/ColourChannelSelector";
import { fireEvent, render, screen } from "@testing-library/react";
import { colours } from "utils/test-utils";

describe("Colour Channel Selector", () => {
  it("should render colour buttons", () => {
    render(<ColourChannelSelector selectedColours={colours} />);

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should disable unavailable colours", () => {
    render(<ColourChannelSelector selectedColours={colours} />);

    expect(screen.getByText("B")).toHaveAttribute("disabled", "");
  });

  it("should display selected colours", () => {
    render(<ColourChannelSelector selectedColours={colours} />);

    expect(screen.getByText("Y")).toHaveAttribute("aria-selected", "true");
  });

  it("should display unselected colours", () => {
    render(<ColourChannelSelector selectedColours={colours} />);

    expect(screen.getByText("R")).toHaveAttribute("aria-selected", "false");
  });

  it("should not fire event if onChange is not provided", () => {
    render(<ColourChannelSelector selectedColours={colours} />);

    fireEvent.click(screen.getByText("R"));
  });

  it("should fire event if selected colours change", () => {
    const handleChange = vi.fn();

    render(<ColourChannelSelector selectedColours={colours} onChange={handleChange} />);

    fireEvent.click(screen.getByText("R"));

    expect(handleChange).toBeCalledWith({
      blue: null,
      cyan: null,
      green: null,
      grey: null,
      magenta: null,
      red: true,
      yellow: true,
    });
  });
});
