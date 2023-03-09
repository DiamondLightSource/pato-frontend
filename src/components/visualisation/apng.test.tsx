import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import APNGViewer from "components/visualisation/apng";

global.URL.createObjectURL = jest.fn(() => "http://localhost/noimage.png");

describe("APNG", () => {
  it("should render valid png image", async () => {
    renderWithProviders(<APNGViewer src='tomograms/1/movie' />);
    await screen.findByLabelText("Frame Image");
  });

  it("should display correct frame count", async () => {
    renderWithProviders(<APNGViewer src='tomograms/1/movie' />);
    await screen.findByLabelText("Frame Image");

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemax", "2");
  });

  it("should stop at last frame when playing", async () => {
    renderWithProviders(<APNGViewer src='tomograms/1/movie' />);
    await screen.findByLabelText("Frame Image");

    const playButton = screen.getByLabelText("Play");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("2");
    });

    await screen.findByLabelText("Play");
  });

  it("should stop at first frame when playing in reverse", async () => {
    renderWithProviders(<APNGViewer src='tomograms/1/movie' />);
    await screen.findByLabelText("Frame Image");

    fireEvent.change(screen.getByRole("slider"), { value: 2 });

    const reverseButton = screen.getByLabelText("Play in Reverse");
    fireEvent.click(reverseButton);

    const playButton = screen.getByLabelText("Play");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("0");
    });
  });

  it("should display message when no image data is available", async () => {
    renderWithProviders(<APNGViewer src='tomograms/2/movie' />);
    await screen.findByText("No Image Data Available");
  });
});
