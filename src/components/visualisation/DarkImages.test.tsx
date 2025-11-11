import { screen } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import { DarkImageCount } from "components/visualisation/DarkImages";

describe("Dark Images", () => {
  it("should display number of dark images", () => {
    renderWithProviders(<DarkImageCount count={10} />);

    expect(screen.getByText("Dark Images: 10")).toBeInTheDocument();
  });

  it("should display message when no tilt alignment data is present", () => {
    renderWithProviders(<DarkImageCount count={null} />);

    expect(screen.getByText("No tilt alignment data available")).toBeInTheDocument();
  });

  it("should display '?' if count is not yet defined", () => {
    renderWithProviders(<DarkImageCount count={undefined} />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
