import { ColourChannelSelector } from "components/clem/ColourChannelSelector";
import { fireEvent, render, screen } from "@testing-library/react";
import { colours } from "utils/test-utils";

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

describe("Colour Channel Selector", () => {
  it("should render colour buttons", () => {
    render(<ColourChannelSelector selectedColours={colours} baseImagePath='' />);

    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should disable unavailable colours", () => {
    render(<ColourChannelSelector selectedColours={colours} baseImagePath='' />);

    expect(screen.getByText("B")).toHaveAttribute("disabled", "");
  });

  it("should display selected colours", () => {
    render(<ColourChannelSelector selectedColours={colours} baseImagePath='' />);

    expect(screen.getByText("Y")).toHaveAttribute("aria-selected", "true");
  });

  it("should display unselected colours", () => {
    render(<ColourChannelSelector selectedColours={colours} baseImagePath='' />);

    expect(screen.getByText("R")).toHaveAttribute("aria-selected", "false");
  });

  it("should not fire event if onChange is not provided", () => {
    render(<ColourChannelSelector selectedColours={colours} baseImagePath='' />);

    fireEvent.click(screen.getByText("R"));
  });

  it("should copy the path to the images", () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText"); 
    render(<ColourChannelSelector selectedColours={colours} baseImagePath='foo/last_bit.png' />);

    fireEvent.click(screen.getByText("Copy Path"));
    expect(writeTextSpy).toHaveBeenCalledWith("foo")
  });

  it("should fire event if selected colours change", () => {
    const handleChange = vi.fn();

    render(<ColourChannelSelector selectedColours={colours} onChange={handleChange} baseImagePath='' />);

    fireEvent.click(screen.getByText("R"));

    expect(handleChange).toHaveBeenCalledWith({
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
