import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "utils/test-utils";
import APNGViewer from "components/visualisation/apng";
import { server } from "mocks/server";
import { rest } from "msw";

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

    fireEvent.click(screen.getByLabelText("Play"));

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("2");
    });

    fireEvent.click(screen.getByLabelText("Play in Reverse"));
    fireEvent.click(await screen.findByLabelText("Play"));

    await screen.findByLabelText("Pause");
    await screen.findByLabelText("Play");

    await waitFor(() => {
      expect(screen.getByLabelText("Current Frame")).toHaveTextContent("0");
    });
  });

  it("should display message when no image data is available", async () => {
    server.use(rest.get("http://localhost/tomograms/:tomogramId/movie", (req, res, ctx) => res.once(ctx.status(404))));
    renderWithProviders(<APNGViewer src='tomograms/2/movie' />);
    await screen.findByText("No Image Data Available");
  });

  it("should update button state when paused", async () => {
    renderWithProviders(<APNGViewer src='tomograms/1/movie' />);
    await screen.findByLabelText("Frame Image");

    fireEvent.click(screen.getByLabelText("Play"));
    fireEvent.click(screen.getByLabelText("Pause"));

    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });
});
